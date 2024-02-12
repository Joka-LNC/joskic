import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React from 'react'

export default function Home () {
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
      <div>
        <h1 className={styles.title}>About the project</h1>
        <p className={styles.text}>Ova aplikacija služi za upravljanje NFT kolekcijom na Flow lancu povezanih zapisa. Kreirana je kao završni rad na Veleučilištu Velika Gorica. Prilikom izrade aplikacije korišten je Cadence programski jezik za pisanje pametnog ugovora kojim se omogućuje komunikacija s lancem povezanih zapisa, te Next.js razvojno okruženje za izradu same web aplikacije.</p>
      </div>
    </>
  )
}
