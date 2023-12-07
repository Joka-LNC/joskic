import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home () {
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
      <div>
        <h1 className={styles.title}>About the project</h1>
        <p className={styles.text}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aenean euismod elementum nisi quis eleifend quam adipiscing vitae proin. Adipiscing elit ut aliquam purus sit amet luctus. Ultricies integer quis auctor elit sed. Elementum sagittis vitae et leo duis ut diam quam nulla. Lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque. Scelerisque fermentum dui faucibus in ornare quam viverra. Dui sapien eget mi proin sed. Elit eget gravida cum sociis natoque penatibus. Tortor id aliquet lectus proin nibh. Enim nec dui nunc mattis. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Duis ultricies lacus sed turpis tincidunt id. Urna nec tincidunt praesent semper feugiat nibh. Ultrices neque ornare aenean euismod elementum nisi quis eleifend quam. Aenean et tortor at risus viverra adipiscing at in tellus. Dolor magna eget est lorem ipsum dolor sit amet. Aliquam faucibus purus in massa tempor nec feugiat nisl pretium.

Dui vivamus arcu felis bibendum ut. Et tortor at risus viverra adipiscing at in tellus. Quam nulla porttitor massa id. Etiam tempor orci eu lobortis elementum nibh. Cras ornare arcu dui vivamus arcu felis bibendum ut. Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero. Tortor at auctor urna nunc id. Non diam phasellus vestibulum lorem sed risus ultricies tristique. Diam vel quam elementum pulvinar etiam non quam. Convallis convallis tellus id interdum velit. Massa tincidunt nunc pulvinar sapien. Cursus sit amet dictum sit amet justo donec enim.</p>
      </div>
    </>
  )
}
