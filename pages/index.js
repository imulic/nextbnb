import Image from 'next/image'
import styles from '../styles/Home.module.css'
import House from '../components/House'
import Layout from '../components/Layout'
import Cookies from 'cookies'
import { useStoreActions } from 'easy-peasy'
import { useEffect } from 'react'
import { House as HouseModel } from '../model.js'

export default function Home({ nextbnb_session, houses }) {
  const setLoggedIn = useStoreActions((actions) => actions.login.setLoggedIn)

  useEffect(() => {
    if (nextbnb_session) {
      setLoggedIn(true)
    }
  }, [])

  return (
    <Layout
      content={
        <div>
          <h2>Places to stay</h2>

          <div className="houses">
            {houses.map((house, index) => {
              return <House key={index} {...house} />
            })}
          </div>

          <style jsx>{`
            .houses {
              display: grid;
              grid-template-columns: 49% 49%;
              grid-template-rows: 300px 300px;
              grid-gap: 2%;
            }
          `}</style>
        </div>
      }
    />
  )
}

export async function getServerSideProps({ req, res, query }) {
  const cookies = new Cookies(req, res)
  const nextbnb_session = cookies.get('nextbnb_session')
  const houses = await HouseModel.findAndCountAll()

  console.log(houses.rows)
  return {
    props: {
      nextbnb_session: nextbnb_session || null,
      houses: houses.rows.map((house) => house.dataValues)
    }
  }
}