import Head from 'next/head'
import * as fcl from '@onflow/fcl'
import Link from 'next/link'
import { BeatLoader } from 'react-spinners'
import { React, useState, useEffect } from 'react'

export default function Collected () {
  const [nfts, setNfts] = useState([])
  const [collectionCreated, setCollectionCreated] = useState(true)
  const [collectionEmpty, setCollectionEmpty] = useState(false)
  const [txStatus, setTxStatus] = useState('')

  useEffect(() => {
    const userAddress = localStorage.getItem('userAddress')

    if (userAddress) {
      try {
        const readAccountNFTs = ` import Joskicv2 from 0x90f6eb85d9c0cc1d
                                  import MetadataViews from 0x631e88ae7f1d7c20
                                  pub fun main(address: Address): [Joskicv2.CustomMetadata] {
                                    let collection = getAccount(address).getCapability(Joskicv2.CollectionPublicPath)
                                      .borrow<&Joskicv2.Collection{MetadataViews.ResolverCollection}>()
                                      ?? panic('Could not borrow a reference to the collection')
                                    let ids = collection.getIDs()
                                    var answer: [Joskicv2.CustomMetadata] = []
                                    for id in ids {
                                      let nft = collection.borrowViewResolver(id: id)
                                      let view = nft.resolveView(Type<Joskicv2.CustomMetadata>())!
                                      let customMetadata = view as! Joskicv2.CustomMetadata
                                      answer.append(customMetadata)
                                    }
                                    return answer
                                  } `
        fcl.query({
          cadence: readAccountNFTs,
          args: (arg, t) => [arg(userAddress, t.Address)]
        }).then(response => {
          if (response.length === 0) {
            setCollectionEmpty(true)
            setCollectionCreated(true)
          } else {
            setNfts(response)
            setCollectionCreated(true)
          }
        }).catch(error => {
          console.error('Error fetching NFTs:', error)
          setCollectionCreated(false)
        })
      } catch (error) {
        console.error('Error in try block:', error)
        setCollectionCreated(false)
      }
    }
  }, [])

  const createCollection = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: ` import Joskicv2 from 0x90f6eb85d9c0cc1d
                   import NonFungibleToken from 0x631e88ae7f1d7c20
                   import MetadataViews from 0x631e88ae7f1d7c20
                   transaction() {
                     prepare(signer: AuthAccount) {
                       if signer.borrow<&Joskicv2.Collection>(from: Joskicv2.CollectionStoragePath) == nil {
                         signer.save(<- Joskicv2.createEmptyCollection(), to: Joskicv2.CollectionStoragePath)
                         signer.link<&Joskicv2.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(Joskicv2.CollectionPublicPath, target: Joskicv2.CollectionStoragePath)
                       }
                     }
                     execute {
                       log('Collection created.')
                     }
                   }`,
        args: (arg, t) => [],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 999
      })
      console.log('Transaction ID: ' + transactionId)
      fcl.tx(transactionId).subscribe(res => {
        console.log(res)
        if (res.status === 0 || res.status === 1) {
          setTxStatus('Pending...')
        } else if (res.status === 2) {
          setTxStatus('Finalized...')
        } else if (res.status === 3) {
          setTxStatus('Executed...')
        } else if (res.status === 4) {
          setTxStatus('Sealed!')
          setCollectionCreated(true)
        }
      })
    } catch (error) {
      console.error('Error creating collection:', error)
      setTxStatus('Transaction failed')
    }
  }

  return (
    <>
        <Head>
            <title>Završni rad Ivan Joskić</title>
            <meta charset='UTF-8'/>
            <meta name='description' content='No Art Project'/>
            <meta name='keywords' content='HTML, CSS, JavaScript'/>
            <meta name='author' content='Ivan Joskić'/>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
        </Head>
        <div className='nft-container'>
            <div className='content'>
              {
              collectionCreated && !collectionEmpty
                ?
                  (

                    nfts.map((nft, index) => (
                  <div key={index} className='nft'>
                    <h2>{`ID: ${nft.id}`}</h2>
                    <p>{`Name: ${nft.name}`}</p>
                    <p>{`Attribute 1: ${nft.att1}`}</p>
                    <p>{`Attribute 2: ${nft.att2}`}</p>
                    <p>{`Attribute 3: ${nft.att3}`}</p>
                    <p>{`Attribute 4: ${nft.att4}`}</p>
                  </div>
                    ))
                  )
                :
                collectionCreated
                  ?
                    (

                    <div className='no-nft-message'>
                      <h1>User currently does not own any NFTs from this collection. Lets change that!</h1>
                      <button className='button'><Link href='/mint'>Mint</Link></button>
                    </div>
                    )
                  :
                    (

                    <div className='no-nft-message'>
                      <h1>Looks like you do not have a collection created in your account yet. Lets fix that!</h1>
                      <button className='button' onClick={createCollection}>Create Collection</button>
                          {txStatus === 'Pending...' || txStatus === 'Finalized...' || txStatus === 'Executed...'
                          ?
                              (
                        <div>
                          <BeatLoader color='#123abc' loading={true} size={15} />
                          <p>{txStatus}</p>
                        </div>
                              )
                            :
                              (

                        <p>{txStatus}</p>
                              )}
                    </div>
                    )}
            </div>
        </div>
    </>
  )
}
