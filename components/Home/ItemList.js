import styled from 'styled-components'
import PerfectScrollbar from 'react-perfect-scrollbar'

const DEFAULT_IMAGE_URL = '/assets/default-asset-img.jpg';

const Wrapper = styled.div`
  position: relative;
  &:after {
    content: ' ';
    position: absolute;
    height: 328px;
    width: 61px;
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
  .item-group {
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
  .item-group-items {
    flex-wrap: wrap;
    align-items: flex-start;
    display: flex;
  }
  .item-group-item {
    background-color: var(--color-gold);
    height: 64px;
    width: 60px;
    margin-right: 6px;
    margin-bottom: 6px;

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

function groupByCategory(items) {
  const group = {}
  items.forEach((item) => {
    const category = item.collection ? item.collection.name : 'Other';
    if (group[category]) {
      group[category].push(item)
    } else {
      group[category] = [item]
    }
  })

  const result = [];
  
  Object.keys(group).forEach(key => {
    while(group[key].length > 0) {
      result.push({
        category: key,
        items: group[key].splice(0, 20)
      })
    }
  })

  return result;
}

export default function ItemList({ items = [], onClickItem }) {
  const groupedItems = groupByCategory(items)

  return (
    <Wrapper>
      <PerfectScrollbar className="scrollview" option={{ suppressScrollY: true }}>
        {groupedItems.map((categoryGroup, idx) => (
          <div className="item-group" key={categoryGroup.category + idx}>
            <div className="cateogry">{categoryGroup.category}</div>
            <div className="item-group-items">
              {categoryGroup.items.map((item) => (
                <div
                  key={item.id}
                  className="item-group-item"
                  style={{
                    backgroundColor: item.background_color || '#ccc',
                    backgroundImage: `url(${item.image_url || DEFAULT_IMAGE_URL})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={() => (onClickItem && onClickItem(categoryGroup.category, item))}
                />
              ))}
            </div>
          </div>
        ))}
      </PerfectScrollbar>
    </Wrapper>  
  )
}