import React, { useEffect } from 'react'
import { Upload } from 'antd'
import styled from 'styled-components'
import { MainText } from '../../../styles'
import { useDarkMode, useNFTDetails } from '../../../context'

const PREVIEW_CONTAINER = styled.div`
  border-radius: 20px;
  background-color: ${({ theme }) => theme.propertyBg};
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 90%;
  max-width: 532px;
  aspect-ratio: 1;
  align-self: flex-end;
  padding: ${({ theme }) => theme.margin(2.5)} ${({ theme }) => theme.margin(5)};

  .ant-upload-list-picture-card-container {
    width: 100%;
    height: auto;
  }
  .ant-upload-list-picture-card .ant-upload-list-item-info {
    &:before {
      display: none;
    }
  }
  .ant-upload-list-item-actions {
    display: none !important;
  }
  .ant-upload-list {
    border: none;
    border-radius: 10px;
    position: relative;
    width: 100%;
    height: auto;
    margin: ${({ theme }) => theme.margin(1)} auto;
  }
  .ant-upload-list-item {
    padding: 0 !important;
    border: none;
  }
`

const IMAGE_CONTAINER = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.avatarInnerBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  .image-broken {
    width: 140px;
    height: 140px;
  }
  .url-preview {
    width: 100%;
    height: auto;
  }
`

const PREVIEW_TEXT = MainText(styled.span`
  font-size: 20px;
  font-weight: 500;
  color: ${({ theme }) => theme.text7} !important;
  margin-bottom: ${({ theme }) => theme.margin(1)};
`)

const NAME_TEXT = MainText(styled.span`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.text7} !important;
`)

const SUPPORT_TEXT = styled(NAME_TEXT)`
  font-weight: 800;
  margin-top: ${({ theme }) => theme.margin(2)};
`

const BOTTOM_INFO = styled.div`
  margin-top: ${({ theme }) => theme.margin(2)};
  display: flex;
  flex-direction: column;
`

interface Props {
  file?: any
  status?: string
  image_url?: string
}

const PreviewImage = ({ file, status, image_url }: Props) => {
  const { nftMetadata, nftMintingData } = useNFTDetails()
  const { mode } = useDarkMode()

  useEffect(() => {
    // console.log(file)
  }, [file])

  return (
    <PREVIEW_CONTAINER>
      <PREVIEW_TEXT>Preview</PREVIEW_TEXT>
      {status === 'failed' ? (
        <IMAGE_CONTAINER>
          <img className="image-broken" src={`/img/assets/image-broken.svg`} alt="" />
        </IMAGE_CONTAINER>
      ) : file ? (
        <Upload
          beforeUpload={(e) => false}
          listType="picture-card"
          maxCount={1}
          fileList={[file]}
          onPreview={() => {}}
        />
      ) : (
        <IMAGE_CONTAINER>
          <img
            className={`${image_url ? 'url-preview' : 'image-broken'}`}
            src={image_url ? image_url : `/img/assets/nft-preview${mode !== 'dark' ? '-light' : ''}.svg`}
            alt="nft-preview"
          />
        </IMAGE_CONTAINER>
      )}
      <BOTTOM_INFO>
        {image_url ? (
          <NAME_TEXT>{nftMetadata?.name}</NAME_TEXT>
        ) : (
          <NAME_TEXT>{nftMintingData?.name || 'Name your item'}</NAME_TEXT>
        )}
        {!image_url && (
          <SUPPORT_TEXT>
            {nftMintingData?.properties.maxSupply === 1
              ? 'Single item 1/1'
              : `Multiple items (${nftMintingData?.properties.maxSupply})`}
          </SUPPORT_TEXT>
        )}
      </BOTTOM_INFO>
    </PREVIEW_CONTAINER>
  )
}

export default PreviewImage
