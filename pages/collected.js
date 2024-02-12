import Head from "next/head";
import { useEffect, useState } from 'react';
import * as fcl from "@onflow/fcl";
import React from 'react';
import Link from "next/link";
import { ProgressBar } from  'react-loader-spinner';

export default function Collected() {
  const [nfts, setNfts] = useState([]);
  const [collectionCreated, setCollectionCreated] = useState(true);
  const [collectionEmpty, setCollectionEmpty] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [recipient, setRecipient] = useState('');
  const [user, setUser] = useState({ loggedIn: null });

  useEffect(() => {
    return fcl.currentUser().subscribe(user => {
      console.log('User:', user.addr)
      setUser(user)
    })
  }, [])

  useEffect(() => {
    const userAddress = localStorage.getItem('userAddress');
    if (userAddress) {
      try {
        const readAccountNFTs = ` import Joskicv2 from 0x90f6eb85d9c0cc1d
                                  import MetadataViews from 0x631e88ae7f1d7c20
                                  pub fun main(address: Address): [Joskicv2.CustomMetadata] {
                                    let collection = getAccount(address).getCapability(Joskicv2.CollectionPublicPath)
                                      .borrow<&Joskicv2.Collection{MetadataViews.ResolverCollection}>()
                                      ?? panic("Could not borrow a reference to the collection")
                                    let ids = collection.getIDs()
                                    var answer: [Joskicv2.CustomMetadata] = []
                                    for id in ids {
                                      let nft = collection.borrowViewResolver(id: id)
                                      let view = nft.resolveView(Type<Joskicv2.CustomMetadata>())!
                                      let customMetadata = view as! Joskicv2.CustomMetadata
                                      answer.append(customMetadata)
                                    }
                                    return answer
                                  } `;
        fcl.query({
          cadence: readAccountNFTs,
          args: (arg, t) => [arg(userAddress, t.Address)],
        }).then(response => {
          if (response.length === 0) {
            setCollectionEmpty(true);
            setCollectionCreated(true);
          } else {
            setNfts(response);
            setCollectionCreated(true);
          }
        }).catch(error => {
          console.error('Error fetching NFTs:', error);
          setCollectionCreated(false);
        });
      } catch (error) {
        console.error('Error in try block:', error);
        setCollectionCreated(false);
      }
    }
  }, []);

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
                       log("Collection created.")
                     }
                   }`,
        args: (arg, t) => [],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 999,
      });
      console.log("Transaction ID: " + transactionId);
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
        if (res.status === 0 || res.status === 1) {
          setTxStatus('Pending...');
        } else if (res.status === 2) {
          setTxStatus('Finalized...');
        } else if (res.status === 3) {
          setTxStatus('Executed...');
        } else if (res.status === 4) {
          setTxStatus('Sealed!');
          setCollectionCreated(true);
        }
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      setTxStatus('Transaction failed');
    }
  };

  async function transferNFT(recipient, withdrawID) {

    const transactionId = await fcl.mutate({
      cadence: `
      import Joskicv2 from 0x90f6eb85d9c0cc1d
      import NonFungibleToken from 0x631e88ae7f1d7c20

      transaction(recipient: Address, withdrawID: UInt64) {
        let ProviderCollection: &Joskicv2.Collection{NonFungibleToken.Provider}
        let RecipientCollection: &Joskicv2.Collection{NonFungibleToken.CollectionPublic}
        
        prepare(signer: AuthAccount) {
          self.ProviderCollection = signer.borrow<&Joskicv2.Collection{NonFungibleToken.Provider}>(from: Joskicv2.CollectionStoragePath)
                                      ?? panic("This user does not have a Collection.")
      
          self.RecipientCollection = getAccount(recipient).getCapability(Joskicv2.CollectionPublicPath)
                                      .borrow<&Joskicv2.Collection{NonFungibleToken.CollectionPublic}>()!
        }
      
        execute {
          self.RecipientCollection.deposit(token: <- self.ProviderCollection.withdraw(withdrawID: withdrawID))
        }
      }
      `,
      args: (arg, t) => [
        arg(recipient, t.Address),
        arg(withdrawID, t.UInt64)
      ],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    });

    console.log('Transaction Id', transactionId);
    fcl.tx(transactionId).subscribe(res => {
      console.log(res);
      if (res.status === 0 || res.status === 1) {
        setTxStatus('Pending...');
      } else if (res.status === 2) {
        setTxStatus('Finalized...');
      } else if (res.status === 3) {
        setTxStatus('Executed...');
      } else if (res.status === 4) {
        setTxStatus('Sealed!');
      }
    });
  }

  return (
    <>
      <Head>
        <title>Završni rad Ivan Joskić</title>
        <meta charset="UTF-8"/>
        <meta name="description" content="Završni rad"/>
        <meta name="keywords" content="HTML, CSS, JavaScript"/>
        <meta name="author" content="Ivan Joskić"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </Head>
      {user.loggedIn ? (
        <div className="collected-container">
          <div className="content">
            {collectionCreated && !collectionEmpty ? (
              nfts.map((nft, index) => (
                <div key={index} className="nft">
                  <h2>{`ID: ${nft.id}`}</h2>
                  <p>{`Name: ${nft.name}`}</p>
                  <p>{`Attribute 1: ${nft.att1}`}</p>
                  <p>{`Attribute 2: ${nft.att2}`}</p>
                  <p>{`Attribute 3: ${nft.att3}`}</p>
                  <p>{`Attribute 4: ${nft.att4}`}</p>
                  <input type="text" onChange={e => setRecipient(e.target.value)}></input>
                  <button onClick={() => {
                    transferNFT(recipient, nft.id);
                    setRecipient('');
                  }}>Transfer</button>
                </div>
              ))
            ) : collectionCreated ? (
              <div className="no-nft-message">
                <h1>User currently doesn't own any NFTs from this collection. Let's change that!</h1>
                <button className="claim-button"><Link href="/mint">Mint</Link></button>
              </div>
            ) : (
              <div className="no-nft-message">
                <h1>Looks like you don't have a collection created in your account yet. Let's fix that!</h1>
                <button onClick={createCollection}>Create Collection</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <h1 className="no-nft-message">Please log in to see page content.</h1>
      )}
      {txStatus === 'Pending...' || txStatus === 'Finalized...' || txStatus === 'Executed...' || txStatus === 'Sealed!' ? (
        <div className="loader-popup">
          <ProgressBar
            height="100"
            width="100"
            ariaLabel="progress-bar-loading"
            wrapperStyle={{}}
            wrapperClass="progress-bar-wrapper"
            borderColor = '#F4442E'
            barColor = '#51E5FF'
          />
          <p>{txStatus}</p>
          {txStatus === 'Sealed!' && <button onClick={() => { setTxStatus('Run Transaction'); window.location.reload(); }}>OK</button>}
        </div>
      ) : null}
    </>
  );
}