import styled from 'styled-components'

export const PageWrapper = styled.section`
  .watch-video {
    display: inline-flex;
    align-items: center;

    text-decoration: underline;
    color: var(--color-red);

    img {
      margin-right: 10px;
      @media all and (max-width: 577px) {
        height: 10px;
      }
    }
  }
`

export const Statics = styled.div`
  border-radius: 12px;
  background-color: var(--color-black);
  color: var(--color-white);
  max-width: 943px;
  margin: 0 auto 53px;
  padding: 11px 20px 7px;
  text-align: left;
  @media all and (max-width: 577px) {
    margin-bottom: 22px;
    padding: 7px 12px;
  }

  .statics__item {
    margin: 10px 20px;
    white-space: nowrap;
    @media all and (max-width: 577px) {
      margin: 5px 10px;
      width: calc(50% - 20px);
    }
  }
`

export const OurTokens = styled.div`
  margin: 33px -18px -5px;

  h2 {
    color: var(--color-white);
    margin-bottom: 17px;
  }

  .buttons {
    flex-wrap: wrap;

    a button {
      margin: 0;
    }
  }

  a {
    margin: 5px 18px;
  }

  button {
    width: 130px;
    border-radius: 10px;
    box-shadow: var(--box-shadow);

    font-size: 24px;
    line-height: 1;
    font-weight: bold;

    &:hover {
      background: var(--color-red);
    }
    @media all and (max-width: 577px) {
      font-size: 16px;
      line-height: 20px;
    }
  }
`
