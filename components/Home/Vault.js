import { useState } from 'react'
import styled from 'styled-components'
import PerfectScrollbar from 'react-perfect-scrollbar'
import AssetModal from 'components/Markets/AssetModal'
import Spinner from 'components/common/Spinner'

const DEFAULT_IMAGE_URL = '/assets/default-asset-img.jpg'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  border-radius: 4px;
  background-color: rgba(255,255,255,0.4);
  box-shadow: 0 2px 15px 0 rgb(0 0 0 / 14%);
  padding: 24px 0;
  position: relative;
  min-height: 500px;

  .asset-group {
    padding: 10px 17px 16px;

    &:last-of-type {
      margin-right: 0;
    }
  }
  .cateogry {
    color: var(--color-black);
    text-align: left;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .asset-group-assets {
    flex-wrap: wrap;
    align-assets: flex-start;
    display: flex;
  }
  .asset-group-asset {
    background-color: var(--color-gold);
    height: 143px;
    width: 80px;
    margin-right: 7px;
    margin-bottom: 7px;
    cursor: pointer;

    &.size-2 {
      width: 89px;
      height: 89px;
      margin-right: 3px;
      margin-bottom: 3px;
    }

    & > img {
      width: 100%;
      height: auto;
    }
  }
`

const MAX_GROUP_SIZE = 20

const categoryOrder = ['Beeple Crap', 'Land', 'Monument', 'Soundspace']

function groupByCategory(assets) {
  const group = {}
  assets.forEach((asset, idx) => {
    const category = asset.category ? asset.category : 'Other'
    asset.orderId = idx + 1
    asset.category = category
    if (group[category]) {
      group[category].push(asset)
    } else {
      group[category] = [asset]
    }
  })

  const sortedKeys = Object.keys(group).sort((a, b) => {
    const aOrder = categoryOrder.indexOf(a)
    const bOrder = categoryOrder.indexOf(b)
    return (aOrder === -1 ? 100 : aOrder) - (bOrder === -1 ? 100 : bOrder)
  })

  const result = []

  sortedKeys.forEach((key) => {
    result.push({ category: key, assets: [] })
    for (let i = 0; i < group[key].length; i++) {
      if (result[result.length - 1].assets.length >= MAX_GROUP_SIZE) {
        result.push({ category: key, assets: [] })
      }
      result[result.length - 1].assets.push(group[key][i])
    }
  })

  return result
}

export default function Vault({ assets = [], loading = false }) {
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState()

  const groupedAssets = groupByCategory(assets)

  const handleClick = (asset) => {
    setSelectedAsset(asset)
    setShowAssetModal(true)
  }

  const handleClose = () => {
    setShowAssetModal(false)
  }

  const handlePrev = () => {
    const orderId = Math.max(1, selectedAsset.orderId - 1)
    const prevAsset = assets.find((asset) => asset.orderId === orderId)
    setSelectedAsset(prevAsset)
  }

  const handleNext = () => {
    const orderId = Math.min(assets.length, selectedAsset.orderId + 1)
    const nextAsset = assets.find((asset) => asset.orderId === orderId)
    setSelectedAsset(nextAsset)
  }

  return (
    <Wrapper>
      {loading ? (
        <Spinner />
      ) : (
        groupedAssets.map((categoryGroup, categoryIdx) => (
          <div className="asset-group" key={`category-${categoryIdx}`}>
            <div className="cateogry">{categoryGroup.category}</div>
            <div className="asset-group-assets">
              {categoryGroup.assets.map((asset, assetIdx) => (
                <div
                  key={`${categoryGroup.category}-${assetIdx}`}
                  className={`asset-group-asset ${categoryGroup.category !== 'Beeple Crap' ? 'size-2' : ''}`}
                  style={{
                    backgroundColor: asset.background_color || '#ccc',
                    backgroundImage: `url(${
                      asset.image_url || asset.asset_contract?.image_url || DEFAULT_IMAGE_URL
                    })`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  onClick={() => handleClick(asset)}
                />
              ))}
            </div>
          </div>
        ))
      )}
      {selectedAsset && (
        <AssetModal
          total={assets.length}
          asset={selectedAsset}
          show={showAssetModal}
          onHide={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </Wrapper>
  )
}
