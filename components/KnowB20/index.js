import styled from 'styled-components'

const Wrapper = styled.div`
  background: var(--color-white);
  padding: 24px 35px 20px;
  width: 1216px;
  max-width: 100%;
  border: 1px solid #979797;
  position: relative;
  min-height: 630px;
  .home-header {
    position: relative;
    .header-title {
      padding-bottom: 8px;
    }
  }
  .home-body {
    padding: 32px 0;
    h1, p {
      color: var(--color-black);
    }
    a {
      color: var(--color-pink);
      text-decoration: underline;
      font-size: 16px;
    }
  }
  .border-bottom {
    border-bottom: 1px solid var(--color-border);
  }
  @media (max-width: 767px) {
    padding: 50px 20px 20px;
  }
`

export default function KnowB20() {
  return (
    <Wrapper>
      <div className="home-header">
        <div className="header-title border-bottom">
          <h1 className="col-pink">
            KNOW B.20
          </h1>
        </div>
      </div>
      <div className="home-body">
        <p>
          We want to democratize access <i>and</i> ownership to highly sought-after
          artwork and accelerate the cultural Renaissance in the metaverse.
          The B20 token represents the largest effort so far in this direction.
          It is important to note that we’re fractionalizing ownership, not the assets themselves.
        </p>
        <br /><br /><br />
        <h1>Knowing B20 is Owning it</h1>
        <br />
        <p>
          The total supply of B.20s is 10,000,000.
          There were discussions and more than a little thought on how much to open up forpublic sale and how much to keep.
          We finally decided that about 61% will remain with Metapurse.
          The rationale was simple. B.20 was never meant to be a token sale or an excuse for buyer’s remorse.
          The token was allocated broadly among artist, collaborators, and investors.
          It was launched on January 23 at the Metapalooza, the largest Metaverse art festival.
        </p>
        <br />
        <a href="https://metapurser.substack.com/p/b20-tokenomics" target="_blank">Read More</a>
        <br /><br /><br />
        <h1>Vesting, drip distribution and buyout</h1>
        <br />
        <p>
          Apart from the 16% public sale, all other allocations had a three-month vesting period.
          However, the tokens were not locked up in the conventional sense.
          The first 10% of the tokens were made immediately available.
          The smart contract enabled a linear 'drip distribution', where the remaining 90% was made available at the rate of 1% a day.
          <br /> <br />
          To ensure that the B.20 project left all avenues of financial upsides open for its patrons, a buyout clause was built in.
          Successful buyouts would transfer the proceeds to all B20 token holders, pro rata.
        </p>
      </div>
    </Wrapper>
  )
}
