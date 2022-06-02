import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { Row, Col } from 'antd'
import { notify } from '../../../utils'
import { ParsedAccount } from '../../../web3'
import { Card } from '../Collection/Card'
import NoContent from './NoContent'
import { SearchBar, Loader } from '../../../components'
import { useNFTProfile } from '../../../context'
import { StyledTabContent } from './TabContent.styled'
import { ISingleNFT } from '../../../types/nft_details.d'
import { ILocationState } from '../../../types/app_params.d'
import debounce from 'lodash.debounce'

interface INFTDisplay {
  type: 'collected' | 'created' | 'favorited'
  parsedAccounts?: ParsedAccount[]
  singleNFTs?: ISingleNFT[]
}

const NFTDisplay = (props: INFTDisplay): JSX.Element => {
  const location = useLocation<ILocationState>()
  const { sessionUser, nonSessionProfile } = useNFTProfile()
  const [collectedItems, setCollectedItems] = useState<ISingleNFT[]>()
  const [filteredCollectedItems, setFilteredCollectedItems] = useState<ISingleNFT[]>()
  const [search, setSearch] = useState<string>('')
  const [level, _setLevel] = useState<number>(0)
  const [loading, _setLoading] = useState<boolean>(false)

  const activePointRef = useRef(collectedItems)
  const activePointLevel = useRef(level)
  const activePointLoader = useRef(loading)

  // in place of original `setActivePoint`
  const setCollectedItemsPag = (x) => {
    activePointRef.current = x // keep updated
    setCollectedItems(x)
  }

  const setLevel = (x) => {
    activePointLevel.current = x // keep updated
    _setLevel(x)
  }

  const setLoading = (x) => {
    activePointLoader.current = x // keep updated
    _setLoading(x)
  }

  // const newlyMintedNFT = useMemo(() => {
  //   if (location.state && location.state.newlyMintedNFT) {
  //     if (props.type === 'collected')
  //       notify({
  //         type: 'success',
  //         message: 'NFT Successfully created',
  //         description: `${location.state.newlyMintedNFT.name}`,
  //         icon: 'success'
  //       })

  //     return location.state.newlyMintedNFT
  //   } else {
  //     return undefined
  //   }
  // }, [location])

  useEffect(() => {
    if (props.singleNFTs) {
      setCollectedItemsPag(props.singleNFTs)
    } else if (!props.parsedAccounts || props.parsedAccounts.length === 0) {
      setCollectedItemsPag([])
    } else {
      fetchNFTData(props.parsedAccounts).then((singleNFTs) => {
        setCollectedItemsPag(singleNFTs)
      })
    }

    return () => setCollectedItemsPag(undefined)
  }, [props.singleNFTs, props.parsedAccounts])

  useEffect(() => {
    if (collectedItems) {
      if (search.length > 0) {
        const filteredData = collectedItems.filter(({ nft_name }) =>
          nft_name.toLowerCase().includes(search.trim().toLowerCase())
        )
        setFilteredCollectedItems(filteredData)
      } else {
        setFilteredCollectedItems(collectedItems)
      }
    }

    return () => setFilteredCollectedItems(undefined)
  }, [search, collectedItems])

  const fetchNFTData = async (parsedAccounts: ParsedAccount[]) => {
    let nfts = []
    for (let i = 0; i < parsedAccounts.length; i++) {
      try {
        const val = await axios.get(parsedAccounts[i].data.uri)
        nfts.push({
          non_fungible_id: null,
          nft_name: val.data.name,
          nft_description: val.data.description,
          mint_address: parsedAccounts[i].mint,
          metadata_url: parsedAccounts[i].data.uri,
          image_url: val.data.image,
          animation_url: '',
          collection_id: null,
          token_account: null,
          owner: nonSessionProfile === undefined ? sessionUser.pubkey : nonSessionProfile.pubkey
        })
      } catch (error) {
        console.error(error)
      }
    }
    return nfts
  }

  useEffect(() => {
    window.addEventListener('scroll', scrolling, true)

    return () => window.removeEventListener('scroll', scrolling, true)
  }, [])

  const scrolling = debounce(() => {
    handleScroll()
  }, 100)

  const handleScroll = () => {
    const border = document.getElementById('border')
    if (border !== null) {
      const mainHeight = window.innerHeight
      const totalscroll = mainHeight + border.scrollTop + 100

      if (Math.ceil(totalscroll) < border.scrollHeight || activePointLoader.current) {
        setLoading(false)
      } else {
        // addToList()
      }
    }
  }

  const addToList = () => {
    const total = activePointRef.current
    const newLevel = activePointLevel.current + 1

    if (total?.length > newLevel * 25) {
      setLoading(true)
      const nextData = total.slice(newLevel * 25, (newLevel + 1) * 25)
      setCollectedItemsPag([...activePointRef.current, ...nextData])
      setLevel(newLevel)
      setLoading(false)
    }
  }

  return (
    <StyledTabContent>
      <div className="actions-group">
        <SearchBar className={'profile-search-bar'} filter={search} setFilter={setSearch} />
      </div>
      {filteredCollectedItems === undefined ? (
        <div className="profile-content-loading">
          <div>
            <Loader />
          </div>
        </div>
      ) : filteredCollectedItems && filteredCollectedItems.length > 0 ? (
        <div className="cards-list" id="border">
          <Row gutter={[24, 24]}>
            {filteredCollectedItems.map((nft: ISingleNFT) => (
              <Col sm={10} md={7} lg={6} xl={4} xxl={4} key={nft.mint_address}>
                <Card singleNFT={nft} />
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <NoContent type={props.type} />
      )}
    </StyledTabContent>
  )
}

export default React.memo(NFTDisplay)
