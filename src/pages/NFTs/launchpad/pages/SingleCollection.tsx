import React, { FC, useEffect, useState } from 'react'
import { useNFTLPSelected } from '../../../../context/nft_launchpad'
import styled, { css } from 'styled-components'
import { Col, Row, Tabs } from 'antd'
import { MintProgressBar, TokenSwitch, MintStarts } from './LaunchpadComponents'
import { InfoDivLightTheme, Vesting, RoadMap } from './LaunchpadComponents'
import { SVGBlackToGrey, SVGDynamicReverseMode } from '../../../../styles'
import { SkeletonCommon } from '../../Skeleton/SkeletonCommon'
import { MintButton } from '../launchpadComp/MintButton'
import { TeamMembers } from './LaunchpadComponents'
import { Share } from '../../Share'
import { copyToClipboard } from '../../Collection/CollectionHeader'
import { useDarkMode, useNavCollapse } from '../../../../context'
import { useHistory } from 'react-router-dom'

export const RIGHT_SECTION_TABS = styled.div<{ activeTab: string }>`
  ${({ theme, activeTab }) => css`
    position: relative;
    width: 35vw;
    max-width: 800px;
    min-width: 650px;
    .ant-tabs-nav {
      position: relative;
      z-index: 1;
      .ant-tabs-nav-wrap {
        background-color: #000;
        border-radius: 15px 15px 25px 25px;
        padding-top: ${theme.margin(1.5)};
        padding-bottom: ${theme.margin(1.5)};
        .ant-tabs-nav-list {
          justify-content: space-around;
          width: 100%;
        }
      }
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: ${theme.tabContentBidBackground};
        border-radius: 15px 15px 25px 25px;
      }
    }
    .ant-tabs-ink-bar {
      display: none;
    }
    .ant-tabs-top {
      > .ant-tabs-nav {
        margin-bottom: 0;
        &::before {
          border: none;
        }
      }
    }
    .ant-tabs-tab {
      color: #616161;
      font-size: 14px;
      font-weight: 500;
      .ant-tabs-tab-btn {
        font-size: 17px;
      }
      &.ant-tabs-tab-active {
        .ant-tabs-tab-btn {
          color: #fff;
        }
      }
    }
    .desc {
      font-size: 11px;
      padding: ${({ theme }) => theme.margin(3)};
      font-family: Montserrat;
    }
    .ant-tabs-content-holder {
      height: 450px;
      z-index: 0;
      background-color: ${({ theme }) => theme.bg9}; !important;
      transform: translateY(-32px);
      padding-top: ${({ theme }) => theme.margin(4)};
      padding-bottom: ${({ theme }) => theme.margin(8)};
      border-radius: 0 0 25px 25px;
      .ant-tabs-content {
        height: 100%;
        overflow-x: none;
        overflow-y: scroll;
        ${({ theme }) => theme.customScrollBar('6px')};
      }
    }
    .rst-footer {
      width: 100%;
      position: absolute;
      display: flex;
      left: 0;
      bottom: 0;
      padding: ${theme.margin(2)};
      border-radius: 0 0 25px 25px;
      border-top: 1px solid ${theme.borderColorTabBidFooter};
      background: ${theme.tabContentBidFooterBackground};
      backdrop-filter: blur(23.9091px);
      .rst-footer-button {
        flex: 1;
        color: #fff;
        white-space: nowrap;
        height: 55px;
        ${theme.flexCenter}
        font-size: 17px;
        font-weight: 600;
        border: none;
        border-radius: 29px;
        padding: 0 ${theme.margin(2)};
        cursor: pointer;
        &:not(:last-child) {
          margin-right: ${theme.margin(1.5)};
        }
        &:hover {
          opacity: 0.8;
        }
        &-buy {
          background-color: ${theme.success};
        }
        &-bid {
          background-color: ${theme.primary2};
        }
        &-sell {
          background-color: #bb3535;
        }
        &-flat {
          background-color: transparent;
          color: ${theme.text1};
        }
      }
      .rst-footer-share-button {
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  `}
`
const BACK_IMG = styled.div`
  width: 40px;
  height: 40px;
  margin-left: -30px;
  transform: scale(1.2);
  margin-top: 20px;
  margin-right: 0px;
  cursor: pointer;
`
const SOCIAL_ICON = styled.button`
  background: transparent;
  border: none;

  img {
    height: 24px;
  }
`
const { TabPane } = Tabs

const WRAPPER = styled.div<{ $navCollapsed: boolean }>`
  display: flex;
  align-items: center;
  margin-top: calc(100px - ${({ $navCollapsed }) => ($navCollapsed ? '80px' : '0px')});
  justify-content: space-between;
  .leftPart {
    width: 45%;
    margin-left: 5%;
    display: flex;
    justify-content: end;
  }
  .button {
    border: none;
    background: pink;
    width: 80px;
  }
  .rightPart {
    width: 50%;
    padding-right: 70px;
    margin-left: 100px;
  }
  .collectionName {
    font-weight: 700;
    font-size: 55px;
    line-height: 67px;
  }
  .tagLine {
    font-weight: 600;
    font-size: 30px;
    line-height: 37px;
  }
`

const NFT_COVER = styled.div`
  .image-border {
    background: linear-gradient(96.79deg, #f7931a 4.25%, #ac1cc7 97.61%);
    width: 608px;
    height: 608px;
    border-radius: 20px;
    padding: 5px;
    margin-top: 32px;
    margin-bottom: 30px;
  }
  .ended-img {
    background: linear-gradient(96.79deg, #f7931a 4.25%, #ac1cc7 97.61%);
    width: 608px;
    height: 608px;
    border-radius: 20px;
    padding: 5px;
    margin-top: 32px;
    margin-bottom: 30px;
    opacity: 0.4;
  }
  .sold-text {
    position: absolute;
    width: 600px;
    margin-top: -35%;
    height: 600px;
    font-weight: 700;
    font-size: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 24px;
    text-align: center;
  }
  .inner-image {
    width: 600px;
    height: 600px;
    object-fit: cover;
    border-radius: 20px;
  }
`
const COLLECTION_NAME = styled.div`
  font-weight: 700;
  font-size: 55px;
  line-height: 67px;
  color: ${({ theme }) => theme.text7};
`
const TAG_LINE = styled.div`
  margin-top: 14px;
  font-weight: 600;
  font-size: 30px;
  line-height: 37px;
  color: ${({ theme }) => theme.text4};
`
const PRICE_SOCIAL = styled.div`
  display: flex;
  margin-top: 25px;
  margin-bottom: 35px;
`
const HEIGHT = styled.div`
  min-height: 800px !important ;
`

const TOGGLE_SPACE = styled.div`
  width: 260px;
  position: absolute;
  z-index: 299;
  top: 0;
  margin-left: 420px;
`
const SUMMARY_TAB_CONTENT = styled.div`
  margin: auto;
  padding-left: 30px;
  padding-right: 30px;
  margin-top: 6%;
  font-weight: 600;
  font-size: 20px;
  color: ${({ theme }) => theme.text4};
  div {
    text-align: center;
    span {
      color: ${({ theme }) => theme.primary3};
      text-align: center;
    }
  }
`
export const SingleCollection: FC = () => {
  const { selectedProject, cndyValues } = useNFTLPSelected()
  const { isCollapsed } = useNavCollapse()
  const { mode } = useDarkMode()
  const history = useHistory()
  const isLive =
    (selectedProject?.whitelist && parseInt(selectedProject?.whitelist) < Date.now()) ||
    (!selectedProject?.whitelist && parseInt(selectedProject?.startsOn) < Date.now())
  const displayProgressBar =
    isLive && cndyValues ? (
      <MintProgressBar minted={cndyValues?.itemsRedeemed} totalNFTs={selectedProject?.items} />
    ) : isLive && !cndyValues ? (
      <SkeletonCommon style={{ marginTop: '20px' }} width="600px" height={'70px'} borderRadius="10px" />
    ) : (
      <MintStarts time={selectedProject?.whitelist || selectedProject?.startsOn} />
    )
  let ProgressBar = selectedProject?.items ? (
    displayProgressBar
  ) : (
    <SkeletonCommon style={{ marginTop: '20px' }} width="600px" height={'70px'} borderRadius="10px" />
  )
  if (selectedProject?.ended) ProgressBar = <></>
  return (
    <HEIGHT style={{ height: isCollapsed ? '90vh' : '82vh' }}>
      <WRAPPER $navCollapsed={isCollapsed}>
        <div className="leftPart">
          <BACK_IMG onClick={() => history.goBack()}>
            <img src={`/img/assets/arrow-left${mode}.svg`} />{' '}
          </BACK_IMG>
          <div>
            {selectedProject?.collectionName ? (
              <COLLECTION_NAME>{selectedProject?.collectionName}</COLLECTION_NAME>
            ) : (
              <COLLECTION_NAME>
                <SkeletonCommon width="100%" height="100%" borderRadius="10px" />
              </COLLECTION_NAME>
            )}
            {selectedProject?.tagLine ? (
              <TAG_LINE>{selectedProject?.tagLine}</TAG_LINE>
            ) : (
              <TAG_LINE>
                <SkeletonCommon width="100%" height="100%" borderRadius="10px" />
              </TAG_LINE>
            )}
            {selectedProject?.items ? (
              <PRICE_SOCIAL>
                <InfoDivLightTheme
                  items={selectedProject?.items}
                  currency={undefined}
                  price={undefined}
                ></InfoDivLightTheme>
                <InfoDivLightTheme
                  items={selectedProject}
                  price={selectedProject?.price}
                  currency={selectedProject?.currency}
                ></InfoDivLightTheme>
                <Row justify="space-between" align="middle" style={{ marginLeft: '10px' }}>
                  <Col span={2}>
                    <SOCIAL_ICON onClick={(e) => window.open(selectedProject?.website)}>
                      <SVGBlackToGrey src="/img/assets/domains.svg" alt="domain-icon" />
                    </SOCIAL_ICON>
                  </Col>
                  <Col span={2}>
                    <SOCIAL_ICON onClick={(e) => window.open(selectedProject?.discord)}>
                      <SVGBlackToGrey src="/img/assets/discord_small.svg" alt="discord-icon" />
                    </SOCIAL_ICON>
                  </Col>
                  <Col span={2}>
                    <SOCIAL_ICON onClick={(e) => window.open(selectedProject?.twitter)}>
                      <SVGBlackToGrey src="/img/assets/twitter_small.svg" alt="twitter-icon" />
                    </SOCIAL_ICON>
                  </Col>
                </Row>
              </PRICE_SOCIAL>
            ) : (
              <PRICE_SOCIAL>
                <SkeletonCommon width="500px" height="35px" borderRadius="10px" />
              </PRICE_SOCIAL>
            )}
            <>
              {selectedProject?.summary ? (
                <div>
                  <RIGHT_SECTION_TABS activeTab={'4'}>
                    <Tabs>
                      <TabPane tab="Summary" key="1">
                        <SUMMARY_TAB_CONTENT>
                          <div>{selectedProject?.summary}</div>
                          <br />
                          <div>
                            <span style={{ fontSize: '18px' }}>{selectedProject?.highlightText}</span>
                          </div>
                        </SUMMARY_TAB_CONTENT>
                      </TabPane>
                      <TabPane tab="Roadmap" key="2">
                        <RoadMap roadmap={selectedProject?.roadmap} />
                      </TabPane>
                      <TabPane tab="Team" key="3">
                        <TeamMembers teamMembers={selectedProject?.team} />
                      </TabPane>
                      <TabPane tab="Vesting" key="4">
                        <Vesting currency={selectedProject?.currency} str={''} />
                      </TabPane>
                    </Tabs>
                  </RIGHT_SECTION_TABS>
                  {!selectedProject?.ended ? <MintButton isLive={isLive} /> : <></>}
                </div>
              ) : (
                <>
                  <SkeletonCommon width="700px" height={'450px'} borderRadius="10px" />
                </>
              )}
            </>
          </div>
        </div>
        <div className="rightPart">
          <NFT_COVER>
            {selectedProject?.coverUrl ? (
              <>
                <div className={selectedProject?.ended ? 'ended-img' : 'image-border'}>
                  <img className="inner-image" alt="cover" src={selectedProject?.coverUrl} />
                </div>
                {selectedProject?.ended ? <div className="sold-text">SOLD OUT</div> : <></>}
              </>
            ) : (
              <SkeletonCommon width="600px" height="600px" borderRadius="10px" />
            )}
          </NFT_COVER>
          {ProgressBar}
        </div>
      </WRAPPER>
    </HEIGHT>
  )
}
