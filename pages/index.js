import Head from 'next/head'
import Image from 'next/image'
import {getSession, signOut, useSession} from 'next-auth/react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { useRouter } from 'next/router'
import Feed from '../components/Feed'
import { AnimatePresence } from 'framer-motion'
import { useRecoilState } from 'recoil'
import { modalState, modalTypeState } from '../atoms/modalAtom'
import Modal from "../components/Modal";

export default function Home() {
  const [modalOpen, setModalOpen] = useRecoilState(modalState);
  const [modalType, setModalType] = useRecoilState(modalTypeState);
  const router = useRouter()
  //client side authentication
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/home");
    },
  });

  return (
    <div className="bg-[#f3f2ef] dark:bg-black dark:text-white h-screen
    overflow-y-scroll md:space-y-6">
      <Head>
        <title>Feed | Linkedin</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <main className="flex justify-center gap-x-5 px-4 sm:px12">
        <div className="flex flex-col md:flex-row gap-5">
          <Sidebar />
          <Feed />
        </div>
        {/* widgets */}
        <AnimatePresence>
          {modalOpen && (
            <Modal handleClose={() => setModalOpen(false)} type={modalType} />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

// server side authentication
export async function getServerSideProps(context) {
  //check if user is authenticated on the server
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/home",
      },
    };
  }

  return {
    props: {
      session,
    }, // will be passed to the page component as props
  }
}