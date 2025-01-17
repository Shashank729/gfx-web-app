import React, { FC, useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { IProjectParams } from '../../../../types/nft_launchpad'
import { useNFTLPSelected } from '../../../../context/nft_launchpad'
import { useWallet } from '@solana/wallet-adapter-react'
import styled from 'styled-components'
import { useConnectionConfig } from '../../../../context'
import * as anchor from '@project-serum/anchor'
import {
  awaitTransactionSignatureConfirmation,
  createAccountsForMint,
  mintOneToken,
  SetupState,
  CANDY_MACHINE_PROGRAM,
  createAccountsForMintNonce,
  mintOneTokenNonce,
  mintOneTokenWhitelist,
  getWalletWhitelistPda,
  mintOneTokenCustom
} from '../candyMachine/candyMachine'
import { AlertState } from '../candyMachine/utils'
import { Transaction, PublicKey, sendAndConfirmRawTransaction } from '@solana/web3.js'
import { GatewayProvider } from '@civic/solana-gateway-react'
//import { sendTransaction } from '../candyMachine/connection'
import { MintButtonFunc } from './MintButtonFunc'
import { notify } from '../../../../utils'
import { Col, Row } from 'antd'

const MESSAGE = styled.div`
  margin: -12px 0;
  font-size: 12px;
  font-weight: 700;

  .m-title {
    margin-bottom: 16px;
  }

  .m-icon {
    width: 20.5px;
    height: 20px;
  }
`

export const MintButton: FC<{ isLive: boolean }> = ({ isLive }) => {
  const params = useParams<IProjectParams>()
  const wallet = useWallet()
  const { connection, endpoint, network } = useConnectionConfig()
  const { selectedProject, candyMachineState, candyMachine, cndyValues } = useNFTLPSelected()
  const [isUserMinting, setIsUserMinting] = useState(false)
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined
  })
  const [setupTxn, setSetupTxn] = useState<SetupState>()

  //hooks in context
  const [isWhitelistUser, setIsWhitelistUser] = useState(false)
  const [isValidBalance, setIsValidBalance] = useState(false)
  const [endDate, setEndDate] = useState<Date>()
  const [itemsRemaining, setItemsRemaining] = useState<number>()
  const [isActive, setIsActive] = useState(false)
  const [needTxnSplit, setNeedTxnSplit] = useState(true)
  const [discountPrice, setDiscountPrice] = useState<anchor.BN>()
  //
  const [isNonce, setIsNonce] = useState<boolean>(false)

  const isWhitelist = () => {
    if (
      parseFloat(selectedProject.whitelist) &&
      parseFloat(selectedProject.whitelist) < Date.now() &&
      parseFloat(selectedProject.startsOn) > Date.now()
    )
      return true
    return false
  }

  const onMint = async (beforeTransactions: Transaction[] = [], afterTransactions: Transaction[] = []) => {
    try {
      setIsUserMinting(true)
      document.getElementById('#identity')?.click()
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        let setupMint: SetupState | undefined
        let nonceAccount = anchor.web3.Keypair.generate()
        if (needTxnSplit && setupTxn === undefined) {
          notify({
            message: (
              <MESSAGE>
                <Row className="m-title" justify="space-between" align="middle">
                  <Col>Account Setup</Col>
                  <Col>
                    <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                  </Col>
                </Row>
                <div>Please sign account setup transaction</div>
              </MESSAGE>
            )
          })
          if (!isNonce) {
            setupMint = await createAccountsForMint(candyMachine, wallet.publicKey)
          } else {
            setupMint = await createAccountsForMintNonce(candyMachine, wallet.publicKey, nonceAccount)
          }
          let status: any = { err: false }
          if (setupMint.transaction) {
            status = await awaitTransactionSignatureConfirmation(setupMint.transaction, 60000, connection, true)
          }
          if (status && !status.err) {
            setSetupTxn(setupMint)
            notify({
              message: (
                <MESSAGE>
                  <Row className="m-title" justify="space-between" align="middle">
                    <Col>Success</Col>
                    <Col>
                      <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                    </Col>
                  </Row>
                  <div>Setup transaction succeeded! Please sign minting transaction</div>
                </MESSAGE>
              )
            })
          } else {
            notify({
              type: 'error',
              message: (
                <MESSAGE>
                  <Row className="m-title" justify="space-between" align="middle">
                    <Col>Error</Col>
                    <Col>
                      <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                    </Col>
                  </Row>
                  <div>Mint failed! Please try again!</div>
                </MESSAGE>
              )
            })
            setIsUserMinting(false)
            return
          }
        } else {
          notify({
            message: (
              <MESSAGE>
                <Row className="m-title" justify="space-between" align="middle">
                  {/*<Col>Error</Col>*/}
                  <Col>
                    <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                  </Col>
                </Row>
                <div>Please sign minting transaction</div>
              </MESSAGE>
            )
          })
        }

        if (isNonce) {
          const response = await mintOneTokenNonce(
            candyMachine,
            wallet.publicKey,
            beforeTransactions,
            afterTransactions,
            setupMint ?? setupTxn,
            nonceAccount,
            selectedProject.collectionId,
            wallet.publicKey.toBase58()
          )

          if (response) {
            // manual update since the refresh might not detect
            // the change immediately
            let remaining = itemsRemaining! - 1
            setItemsRemaining(remaining)
            setIsActive((candyMachine.state.isActive = remaining > 0))
            candyMachine.state.isSoldOut = remaining === 0
            setSetupTxn(undefined)
            //  setAlertState({
            //    open: true,
            //    message: 'Congratulations! Mint succeeded!',
            //    severity: 'success',
            //    hideDuration: 7000
            //  })
            notify({
              message: (
                <MESSAGE>
                  <Row className="m-title" justify="space-between" align="middle">
                    <Col>Success!</Col>
                    <Col>
                      <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                    </Col>
                  </Row>
                  <div>Congratulations! Mint succeeded!</div>
                </MESSAGE>
              )
            })
          } else {
            notify({
              message: (
                <MESSAGE>
                  <Row className="m-title" justify="space-between" align="middle">
                    <Col>Error</Col>
                    <Col>
                      <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                    </Col>
                  </Row>
                  <div>Mint failed! Please try again!</div>
                </MESSAGE>
              )
            })
          }
        } else {
          let mintResult = null
          if (isWhitelist()) {
            let wallet_pda = await getWalletWhitelistPda(wallet.publicKey)
            mintResult = await mintOneTokenWhitelist(
              candyMachine,
              wallet.publicKey,
              beforeTransactions,
              afterTransactions,
              setupMint ?? setupTxn,
              wallet_pda[0]
            )
          } else {
            mintResult = await mintOneTokenCustom(
              candyMachine,
              wallet.publicKey,
              beforeTransactions,
              afterTransactions,
              setupMint ?? setupTxn
            )
          }

          let status: any = { err: true }
          let metadataStatus = null
          if (mintResult) {
            status = await awaitTransactionSignatureConfirmation(mintResult.mintTxId, 60000, connection, true)

            metadataStatus = await candyMachine.program.provider.connection.getAccountInfo(
              mintResult.metadataKey,
              'processed'
            )
          }

          if (status && !status.err && metadataStatus) {
            // manual update since the refresh might not detect
            // the change immediately
            let remaining = itemsRemaining! - 1
            setItemsRemaining(remaining)
            setIsActive((candyMachine.state.isActive = remaining > 0))
            candyMachine.state.isSoldOut = remaining === 0
            setSetupTxn(undefined)
            notify({
              message: (
                <MESSAGE>
                  <Row className="m-title" justify="space-between" align="middle">
                    <Col>Success!</Col>
                    <Col>
                      <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                    </Col>
                  </Row>
                  <div>Congratulations! Mint succeeded!</div>
                </MESSAGE>
              )
            })
          } else if (status && !status.err) {
            notify({
              message: (
                <MESSAGE>
                  <Row className="m-title" justify="space-between" align="middle">
                    <Col>Error</Col>
                    <Col>
                      <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                    </Col>
                  </Row>
                  <div>
                    Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the
                    mint failed and if so, make sure you are eligible to mint before trying again.
                  </div>
                </MESSAGE>
              )
            })
          } else {
            notify({
              message: (
                <MESSAGE>
                  <Row className="m-title" justify="space-between" align="middle">
                    <Col>Error</Col>
                    <Col>
                      <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                    </Col>
                  </Row>
                  <div>Mint failed! Please try again!</div>
                </MESSAGE>
              )
            })
          }
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Minting failed! Please try again!'
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction timeout! Please try again.'
        } else if (error.message.indexOf('0x137')) {
          console.log(error)
          message = `SOLD OUT!`
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`
        }
      } else {
        if (error.code === 311) {
          console.log(error)
          message = `SOLD OUT!`
          window.location.reload()
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`
        }
      }

      notify({
        type: 'error',
        message: (
          <MESSAGE>
            <Row className="m-title" justify="space-between" align="middle">
              <Col>Error</Col>
              <Col>
                <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
              </Col>
            </Row>
            <div>{message}</div>
          </MESSAGE>
        )
      })

      // updates the candy machine state to reflect the latest
      // information on chain
    } finally {
      setIsUserMinting(false)
    }
  }

  //

  useEffect(() => {
    if (cndyValues) {
      setIsWhitelistUser(cndyValues.isWhiteListUser)
      setIsValidBalance(cndyValues.validBalance)
      //setDiscountPrice()
      setEndDate(cndyValues.endDate)
      setIsActive(cndyValues.isActive)
      setItemsRemaining(cndyValues.itemsRemaining)
      setNeedTxnSplit(cndyValues.needTxnSplit)
    }
  }, [cndyValues, wallet.connected, wallet.publicKey])

  return (isActive || isWhitelistUser) &&
    candyMachine?.state.gatekeeper &&
    wallet.publicKey &&
    wallet.signTransaction ? (
    <GatewayProvider
      wallet={{
        publicKey: wallet.publicKey || new PublicKey(CANDY_MACHINE_PROGRAM),
        //@ts-ignore
        signTransaction: wallet.signTransaction
      }}
      gatekeeperNetwork={candyMachine?.state?.gatekeeper?.gatekeeperNetwork}
      clusterUrl={endpoint}
      cluster={network}
      handleTransaction={async (transaction: Transaction) => {
        setIsUserMinting(true)
        const userMustSign = transaction.signatures.find((sig) => sig.publicKey.equals(wallet.publicKey!))
        if (userMustSign) {
          notify({
            message: 'Please sign one-time Civic Pass issuance'
          })
          try {
            transaction = await wallet.signTransaction!(transaction)
          } catch (e) {
            notify({
              type: 'error',
              message: (
                <MESSAGE>
                  <Row className="m-title" justify="space-between" align="middle">
                    <Col>Error</Col>
                    <Col>
                      <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                    </Col>
                  </Row>
                  <div>User cancelled signing</div>
                </MESSAGE>
              )
            })
            // setTimeout(() => window.location.reload(), 2000);
            setIsUserMinting(false)
            throw e
          }
        } else {
          //  setAlertState({
          //    open: true,
          //    message: 'Refreshing Civic Pass',
          //    severity: 'info'
          //  })
          notify({
            message: (
              <MESSAGE>
                <Row className="m-title" justify="space-between" align="middle">
                  <Col>Civic Pass</Col>
                  <Col>
                    <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                  </Col>
                </Row>
                <div>Refreshing Civic Pass, Please reload page if unresponsive</div>
              </MESSAGE>
            )
          })
        }
        try {
          // await sendTransaction(connection, wallet, transaction, [], true, 'confirmed')
          let res = await sendAndConfirmRawTransaction(connection, transaction.serialize())
          notify({
            message: (
              <MESSAGE>
                <Row className="m-title" justify="space-between" align="middle">
                  {/*<Col>Civic</Col>*/}
                  <Col>
                    <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                  </Col>
                </Row>
                <div>Please sign minting</div>
              </MESSAGE>
            )
          })
        } catch (e) {
          notify({
            type: 'error',
            message: (
              <MESSAGE>
                <Row className="m-title" justify="space-between" align="middle">
                  <Col>Error</Col>
                  <Col>
                    <img className="m-icon" src={`/img/assets/close-white-icon.svg`} alt="" />
                  </Col>
                </Row>
                <div>Solana dropped the transaction, please try again</div>
              </MESSAGE>
            )
          })
          console.error(e)
          // setTimeout(() => window.location.reload(), 2000);
          setIsUserMinting(false)
          throw e
        }
        await onMint()
      }}
      broadcastTransaction={false}
      options={{ autoShowModal: false }}
    >
      <MintButtonFunc
        onMint={onMint}
        candyMachine={candyMachine}
        isMinting={isUserMinting}
        setIsMinting={(val) => setIsUserMinting(val)}
        isActive={isActive || (isWhitelistUser && isValidBalance)}
        isLive={isLive}
        isWhitelist={isWhitelist()}
        cndyValues={cndyValues}
      ></MintButtonFunc>
    </GatewayProvider>
  ) : (
    <MintButtonFunc
      onMint={onMint}
      candyMachine={candyMachine}
      isMinting={isUserMinting}
      setIsMinting={(val) => setIsUserMinting(val)}
      isActive={isActive || (isWhitelistUser && isValidBalance)}
      isLive={isLive}
      isWhitelist={isWhitelist()}
      cndyValues={cndyValues}
    ></MintButtonFunc>
  )
}
