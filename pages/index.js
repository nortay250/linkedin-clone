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
import { connectToDatabase } from '../util/mongodb'
import Widgets from '../components/Widgets'

export default function Home({posts, articles}) {

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
          <Feed posts={posts}/>
        </div>
        <Widgets articles={articles}/>
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

  //get posts on SSR
  const {db} = await connectToDatabase();
  const posts = await db
    .collection("posts")
    .find()
    .sort({timestamp: -1})
    .toArray();

  //get Google News API
  const results = await fetch(
    `https://newsapi.org/v2/top-headlines?country=sg&apiKey=${process.env.NEWS_API_KEY}`)
      .then((res) => res.json());
  console.log(results);

  return {
    props: {
      session,
      articles: results.articles,
      posts: posts.map((post) => ({
        _id: post._id.toString(),
        input: post.input,
        photoUrl: post.photoUrl,
        username: post.username,
        email: post.email,
        userImg: post.userImg,
        createdAt: post.createdAt,
      })),
    }, // will be passed to the page component as props
  }
}