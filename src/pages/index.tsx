import Head from 'next/head'

import { PrismaClient } from "@prisma/client";

type PoapLink = {
  id: string
  link: string
  claimed: Boolean
}

export default function Home({ link }: PoapLink) {
  return (
    <>
      <Head>
        <title>POAP Randomizer</title>
        <meta name="description" content="POAP Randomizer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {link && <meta httpEquiv="refresh" content={`1; URL=${link}`} />}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ backgroundColor: 'black', textAlign: 'center', color: 'white', fontSize: '2rem' }}>
        {!link && `Claimable link unavailable`}
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const prisma = new PrismaClient();

  // check if there are links
  const db_links_count = await prisma.poap.count()

  if (db_links_count === 0) {
    return { props: { link: '' } }
  }

  const unclaimed_links_count  = await prisma.poap.count({ where: { claimed: false } })

  // when everything has been claimed, reset
  if (unclaimed_links_count === 0) {
    await prisma.poap.updateMany({
      where: { claimed: true },
      data: { claimed: false }
    })
  } 

  const links  = await prisma.poap.findMany({ where: { claimed: false }})
  const index = Math.floor(Math.random() * (links.length))
  const selected_link = links[index]

  const { link } = await prisma.poap.update({
    where: { id: selected_link.id },
    data: { claimed: true }
  })

  return { props: { link } }
}
