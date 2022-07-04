import React, { FC, useState, useMemo } from 'react'
import styled from 'styled-components'
import { MainButton } from '../../components'
import { useWallet } from '@solana/wallet-adapter-react'
import { useFarmContext, usePriceFeedFarm, useAccounts, useTokenRegistry } from '../../context'
import tw from 'twin.macro'

const STYLED_SOL = styled.div`
  ${tw`flex items-center justify-between rounded-[60px] h-[60px] w-[372px] sm:w-[70%] sm:my-[3%] sm:mx-auto`}

  @media(max-width: 500px) {
    background-color: ${({ theme }) => theme.solPillBg};
  }

  .value {
    ${tw`text-average font-medium text-center`}
    font-family: Montserrat;
    color: ${({ theme }) => theme.text15};
  }
  &.active {
    .value {
      ${tw`text-white font-semibold`}
    }
  }
  .textMain {
    ${tw`text-tiny font-semibold text-center flex z-[2] mb-1.5 ml-[--100px] sm:p-[5%] sm:m-0`}
    font-family: Montserrat;
    color: ${({ theme }) => theme.text14};
  }
  .textTwo {
    ${tw`ml-3`}
  }
`
const STYLED_INPUT = styled.input`
  ${tw`flex items-center justify-between rounded-[60px] h-[44px] w-[372px] my-3 mx-2 py-0 px-8 sm:h-full sm:w-[70%] sm:m-0 sm:p-[5%] sm: block`}
  background-color: ${({ theme }) => theme.solPillBg};
  border: none;
  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  @media (max-width: 500px) {
    border: none;
    outline: none;
  }
  .value {
    ${tw`text-average font-medium text-center`}
    font-family: Montserrat;
    color: ${({ theme }) => theme.text15};
  }
  &.active {
    .value {
      ${tw`text-white font-semibold`}
    }
  }
  .textMain {
    ${tw`text-tiny font-semibold text-center flex`}
    font-family: Montserrat;
    color: ${({ theme }) => theme.text14};
  }
  .textTwo {
    ${tw`ml-3`}
  }
`

const STYLED_BUTTON = styled.button`
  ${tw`w-[65px] h-10 rounded-[50px] font-semibold text-center`}
  border: none;
`

const BUTTON_CONTAINER = styled.div`
  ${tw`flex justify-center ml-[10%] mb-4`}
  > div.stake-btn {
    ${tw`bg-black-1 rounded-l-circle`}
  }
  > div.claim-btn {
    ${tw`bg-black-1 rounded-r-circle`}
  }
  .stake {
    ${tw`bg-black-1 rounded-r-none`}
  }
  .claim {
    ${tw`bg-black-1 rounded-l-none`}
  }
  .active {
    ${tw`rounded-circle`}
    background: #3735bb;
  }
`
const STYLED_STAKE_PILL = styled(MainButton)`
  ${tw`w-[372px] h-[44px] text-[14px] font-semibold cursor-pointer rounded-circle text-center leading-[49px] opacity-50 `}
  background-color: ${({ theme }) => theme.stakePillBg};
  font-family: Montserrat;
  color: ${({ theme }) => theme.text14};
  margin: ${({ theme }) => theme.margin(1)} ${({ theme }) => theme.margin(1.5)} 0;
  transition: all 0.3s ease;
  &.active,
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.primary3};
    ${tw`text-white opacity-100`}
    &:disabled {
      ${tw`opacity-50`}
    }
  }
  @media(max-width: 500px){
    ${tw`w-[70%] my-0 mx-auto h-12.5`}
    opacity: 1;
    &:focus {
      background-color: ${({ theme }) => theme.stakePillBg}; 
      color: #fff;
  }
  &.miniButtons {
  }
`
const MAX_BUTTON = styled.div`
  cursor: pointer;
`

const EXPAND_WRAPPER = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-top: 1px solid #8c8c8c;
  margin-top: 30px;

  > img {
    margin-right: 5%;
  }

  .label {
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
  }

  .value {
    color: #b6b6b6;
    font-size: 15px;
  }
`

const STAKE = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 25%;
  margin-top: 15px;
  margin-bottom: 20px;
`
const EARN = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  margin-bottom: 20px;
`
const BALANCE = styled.div`
  justify-content: center;
  display: flex;
  align-items: center;

  .textMain {
    color: #ffffff;
    font-size: 13px;
    margin-right: 3%;
  }

  .value {
    font-weight: 600;
  }
`

export const ExpandedContent: FC<{
  wallet: any
  name: string
  stakeRef: any
  unstakeRef: any
  onClickHalf?: (x: string) => void
  onClickMax?: (x: string) => void
  onClickStake?: any
  onClickUnstake?: any
  onClickDeposit?: any
  onClickWithdraw?: any
  onClickMint?: any
  onClickBurn?: any
  isStakeLoading?: boolean
  isWithdrawLoading?: boolean
  isMintLoading?: boolean
  userSOLBalance?: number
  isBurnLoading?: boolean
  isUnstakeLoading?: boolean
  isSsl?: boolean
  withdrawClicked?: () => void
}> = ({
  wallet,
  name,
  stakeRef,
  unstakeRef,
  onClickHalf,
  onClickMax,
  onClickStake,
  onClickUnstake,
  isStakeLoading,
  isUnstakeLoading,
  onClickDeposit,
  userSOLBalance,
  isWithdrawLoading,
  isSsl,
  withdrawClicked
}) => {
  const { farmDataContext, farmDataSSLContext, operationPending } = useFarmContext()
  const { prices } = usePriceFeedFarm()
  const { getUIAmount } = useAccounts()
  const { publicKey } = useWallet()
  const { getTokenInfoForFarming } = useTokenRegistry()
  const tokenInfo = useMemo(() => getTokenInfoForFarming(name), [name, publicKey])
  const [process, setProcess] = useState<String>('Stake')
  const DISPLAY_DECIMAL = 3
  const userTokenBalance = useMemo(
    () => (publicKey && tokenInfo ? getUIAmount(tokenInfo.address) : 0),
    [tokenInfo?.address, getUIAmount, publicKey]
  )
  const tokenData = !isSsl
    ? farmDataContext.find((token) => token.name === 'GOFX')
    : farmDataSSLContext.find((farmData) => farmData.name === name)

  let tokenPrice = useMemo(() => {
    if (name === 'USDC') {
      return { current: 1 }
    }
    // to get price of the token MSOL must be in upper case while to get tokenInfo address mSOL
    return prices[`${name.toUpperCase()}/USDC`]
  }, [prices[`${name.toUpperCase()}/USDC`]])

  const availableToMint =
    tokenData?.ptMinted >= 0 ? tokenData.currentlyStaked + tokenData.earned - tokenData.ptMinted : 0
  const availableToMintFiat = tokenPrice && availableToMint * tokenPrice.current

  let notEnough
  try {
    let amt = parseFloat(stakeRef.current?.value).toFixed(3)
    notEnough =
      parseFloat(amt) >
      (name === 'SOL' ? parseFloat(userSOLBalance.toFixed(3)) : parseFloat(userTokenBalance.toFixed(3)))
  } catch (e) {}

  return (
    <>
      <EXPAND_WRAPPER>
        <img src={`/img/crypto/${name.toUpperCase()}.svg`} />
        <STAKE>
          <div className="label">{name}</div>
          <div className="value">{name}</div>
        </STAKE>
        <EARN>
          <div className="label">{name}</div>
          <div className="value">{name}</div>
        </EARN>
      </EXPAND_WRAPPER>
      <BUTTON_CONTAINER>
        <div className="stake-btn">
          <STYLED_BUTTON className={`stake ${process === 'Stake' ? 'active' : ''}`} onClick={() => setProcess('Stake')}>
            Stake
          </STYLED_BUTTON>
        </div>
        <div className="claim-btn">
          <STYLED_BUTTON className={`claim ${process === 'Claim' ? 'active' : ''}`} onClick={() => setProcess('Claim')}>
            Claim
          </STYLED_BUTTON>
        </div>
      </BUTTON_CONTAINER>
      <BALANCE>
        <div className="textMain">{name} Wallet Balance:</div>
        <div className="value">
          {userTokenBalance?.toFixed(3)} {name}
        </div>
      </BALANCE>
      <STYLED_SOL>
        <STYLED_INPUT
          className="value"
          type="number"
          placeholder={`0.00 ${name}`}
          ref={process === 'Stake' ? stakeRef : unstakeRef}
        />
        <div className="textMain">
          <MAX_BUTTON onClick={() => onClickHalf(process === 'Stake' ? 'stake' : 'unstake')} className="textOne">
            Half
          </MAX_BUTTON>
          <MAX_BUTTON onClick={() => onClickMax(process === 'Stake' ? 'stake' : 'unstake')} className="textTwo">
            Max
          </MAX_BUTTON>
        </div>
      </STYLED_SOL>
      {!isSsl ? (
        <STYLED_STAKE_PILL
          loading={process === 'Stake' ? isStakeLoading : isUnstakeLoading}
          disabled={process === 'Stake' ? isStakeLoading : isUnstakeLoading}
          onClick={() => (process === 'Stake' ? onClickStake() : onClickUnstake())}
        >
          {process === 'Stake' ? 'Stake' : 'Unstake and Claim'}
        </STYLED_STAKE_PILL>
      ) : (
        <STYLED_STAKE_PILL
          loading={process === 'Stake' ? isStakeLoading : isWithdrawLoading}
          // disabled={process==='Stake' ?
          //     isStakeLoading || notEnough
          //   : isUnstakeLoading || parseFloat(availableToMint.toFixed(DISPLAY_DECIMAL)) <= 0 || operationPending
          // }
          onClick={() => (process === 'Stake' ? onClickDeposit() : withdrawClicked())}
        >
          {process === 'Stake' ? 'Stake' : 'Unstake and Claim'}
        </STYLED_STAKE_PILL>
      )}
    </>
  )
}
