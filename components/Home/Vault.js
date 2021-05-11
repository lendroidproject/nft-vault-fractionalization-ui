import styled from 'styled-components'
import Spinner from 'components/common/Spinner'

const Wrapper = styled.div`
  border-radius: 4px;
  background-color: rgba(255,255,255,0.4);
  box-shadow: 0 2px 15px 0 rgb(0 0 0 / 14%);
  padding: 16px;
  position: relative;
  margin-bottom: 35px;
  min-height: 470px;

  .title {
    color: var(--color-opacity09);
    margin: 20px 0 30px;
    font-size: 26px;
  }

  .media {
    width: 100%;
    height: 400px;
    background: var(--color-black);
  }
`

export default function Vault({ assets = [], loading = false, title="Master Vault", className="" }) {
  return (
    <Wrapper className={className}>
      {title && (<h1 className="title center">{title}</h1>)}
      {loading ? (
        <Spinner />
      ) : (
        <>
          {assets.map((asset) => (
            <div className="asset" key={asset.id}>
              <video
                id={`media-${asset.id}`}
                autoPlay
                className="media"
                controlsList="nodownload"
                loop
                playsInline
                controls
              >
                <source src={asset.image_url || asset.image_preview_url} />
              </video>
            </div>
          ))}
        </>
      )}
    </Wrapper>
  )
}