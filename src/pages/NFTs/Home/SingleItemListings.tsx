import React, { FC } from 'react'
import Slider from 'react-slick'
import { Row, Col } from 'antd'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import styled from 'styled-components'
import { ArrowClicker } from '../../../components'
import { ButtonWrapper } from '../NFTButton'
import { SkeletonCommon } from '../Skeleton/SkeletonCommon'
import { Card } from '../Collection/Card'

const CAROUSEL_WRAPPER = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 16px 32px;
`

const HEADER_CAROUSEL = styled.div`
  display: flex;
  margin: ${({ theme }) => theme.margin(4)} 0;
  align-items: center;
`

const LEFT_ARROW = styled(ArrowClicker)`
  width: 21px;
  transform: rotateZ(90deg);
  margin-right: ${({ theme }) => theme.margin(2)};
`

const RIGHT_ARROW = styled(ArrowClicker)`
  width: 21px;
  transform: rotateZ(270deg);
`

const TITLE_CAROUSEL = styled.span`
  font-size: 18px;
  font-weight: bold;
  text-align: left;
  color: ${({ theme }) => theme.text1};
  flex: 1;
`

const HEADER_END_CAROUSEL = styled.div`
  flex: 1;
  flex-direction: row;
  justify-content: flex-end;
  display: flex;
  align-items: center;
  padding-right: ${({ theme }) => theme.margin(2)};
`

const CARD_WRAPPER = styled.div`
  .card {
    margin: 0 32px;
    width: 332px;
  }
`

const SORT_BUTTON = styled(ButtonWrapper)`
  height: 40px;
  background-color: ${({ theme }) => theme.secondary2};
  margin-right: ${({ theme }) => theme.margin(2)};
  justify-content: space-between;
`

const WRAPPED_LOADER = styled.div`
  position: relative;
  height: 48px;
`
const SKELETON_SLIDER = styled.div`
  display: flex;
  .wrap {
    margin: 0 ${({ theme }) => theme.margin(4)};
  }
`

const settings = {
  infinite: false,
  speed: 500,
  swipeToSlide: true,
  slidesToScroll: 2,
  snapCenter: true,
  initialSlide: 0,
  arrows: false,
  variableWidth: true
}

export interface ISingleItemListings {
  items: Array<any>
  title?: string
}

const SingleItemListings: FC<ISingleItemListings> = ({ items, title }) => {
  const slickRef = React.useRef<any>()

  const slickNext = () => slickRef?.current?.slickNext()
  const slickPrev = () => slickRef?.current?.slickPrev()

  const isEmpty = items.length === 0

  if (!isEmpty) {
    return (
      <CAROUSEL_WRAPPER>
        <HEADER_CAROUSEL>
          {title !== undefined && <TITLE_CAROUSEL>{title}</TITLE_CAROUSEL>}
          <HEADER_END_CAROUSEL>
            <LEFT_ARROW onClick={slickPrev} />
            <RIGHT_ARROW onClick={slickNext} />
          </HEADER_END_CAROUSEL>
        </HEADER_CAROUSEL>

        <Slider ref={slickRef} {...settings}>
          {items.map((item: any, i: number) => (
            <CARD_WRAPPER key={item.non_fungible_id} style={{ minWidth: '300px', margin: '0 32px !important' }}>
              <Card singleNFT={item} />
            </CARD_WRAPPER>
          ))}
        </Slider>
      </CAROUSEL_WRAPPER>
    )
  } else {
    return <></>
  }
}

export default SingleItemListings
