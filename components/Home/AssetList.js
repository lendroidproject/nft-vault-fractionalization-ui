import { useState } from 'react'
import styled from 'styled-components'
import PerfectScrollbar from 'react-perfect-scrollbar'
import AssetModal from './AssetModal'

const DEFAULT_IMAGE_URL = '/assets/default-asset-img.jpg';

const Wrapper = styled.div`
  position: relative;
  &:after {
    content: ' ';
    position: absolute;
    height: 328px;
    width: 7%;
    background: linear-gradient(90deg, rgba(238,238,238,0) 0%, #636363 100%);
    top: 40px;
    right: 0;
  }

  .scrollview {
    width: 100%;
    height: 419px;
    background: var(--linear-gradient2);
    display: flex;
    padding: 40px 20px 50px;
  }
  .asset-group {
    position: relative;
    min-width: 345px;
    min-height: 328px;
    padding: 38px 10px 10px;
    margin-right: 10px;
    background: var(--color-white);
    &:last-of-type {
      margin-right: 0;
    }
  }
  .cateogry {
    position: absolute;
    padding: 4px 10px;
    background: var(--color-blue);
    color: var(--color-white);
    border-radius: 20px;
    text-align: center;
    white-space: nowrap;
    min-width: 120px;
    left: 50%;
    top: -12px;
    transform: translateX(-50%);
  }
  .asset-group-assets {
    flex-wrap: wrap;
    align-assets: flex-start;
    display: flex;
  }
  .asset-group-asset {
    background-color: var(--color-gold);
    height: 64px;
    width: 60px;
    margin-right: 6px;
    margin-bottom: 6px;
    cursor: pointer;

    &:nth-of-type(5n) {
      margin-right: 0;
    }

    & > img {
      width: 100%;
      height: auto;
    }
  }
  .ps {
    .ps__rail-x {
      z-index: 1;
      bottom: 20px;
      opacity: 1;
      height: 6px;
      border: 1px solid #FFFFFF;
      border-radius: 3.5px;
      background-color: #332DE5;
      box-shadow: 0 2px 4px 0 rgba(0,0,0,0.5);
      margin: 0 4%;
      max-width: 92%;
      left: 5%;
    }
    .ps__thumb-x {
      box-sizing: border-box;
      height: 17px;
      border: 1px solid #FFFFFF;
      border-radius: 9px;
      background: linear-gradient(180deg, #0038FF 0%, #FF007E 100%);
      box-shadow: 0 2px 4px 0 rgba(0,0,0,0.5);
      bottom: -6px;
    }
  }
`

const MAX_GROUP_SIZE = 20

const categoryOrder = ['Beeple Crap', 'Land', 'Monument', 'Soundspace']

function groupByCategory(assets) {
  const group = {}
  assets.forEach((asset, idx) => {
    const category = asset.category ? asset.category : 'Other';
    asset.orderId = idx + 1;
    asset.category = category;
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

  const result = [];
  
  sortedKeys.forEach(key => {
    result.push({ category: key, assets: [] })
    for(let i = 0; i < group[key].length; i++) {
      if (result[result.length - 1].assets.length >= MAX_GROUP_SIZE) {
        result.push({ category: key, assets: [] })
      }
      result[result.length - 1].assets.push(group[key][i])
    }
  })

  return result
}

export default function AssetList({ assets = [] }) {
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
    const prevAsset = assets.find(asset => asset.orderId === orderId)
    setSelectedAsset(prevAsset)
  }

  const handleNext = () => {
    const orderId = Math.min(assets.length, selectedAsset.orderId + 1)
    const nextAsset = assets.find(asset => asset.orderId === orderId)
    setSelectedAsset(nextAsset)
  }

  return (
    <Wrapper>
      <PerfectScrollbar className="scrollview" option={{ suppressScrollY: true }}>
        {groupedAssets.map((categoryGroup, categoryIdx) => (
          <div className="asset-group" key={`category-${categoryIdx}`}>
            <div className="cateogry">{categoryGroup.category}</div>
            <div className="asset-group-assets">
              {categoryGroup.assets.map((asset, assetIdx) => (
                <div
                  key={`${categoryGroup.category}-${assetIdx}`}
                  className="asset-group-asset"
                  style={{
                    backgroundColor: asset.background_color || '#ccc',
                    backgroundImage: `url(${asset.image_url || asset.asset_contract?.image_url || DEFAULT_IMAGE_URL})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={() => handleClick(asset)}
                />
              ))}
            </div>
          </div>
        ))}
      </PerfectScrollbar>
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