import houses from "../../houses";
import Head from 'next/head'
import Layout from "../../components/Layout";
import DateRangePicker from '../../components/DateRangePicker'
import { useState,useEffect } from 'react'
import { useStoreActions,useStoreState } from 'easy-peasy'
import Cookies from 'cookies'
import { House as HouseModel } from '../../model.js'
import axios from 'axios'

export default function House({ house, nextbnb_session, bookedDates }) {
	const [dateChosen, setDateChosen] = useState(false)
	const [numberOfNightsBetweenDates, setNumberOfNightsBetweenDates] = useState(0)
	const setShowLoginModal = useStoreActions(
		(actions) => actions.modals.setShowLoginModal
	)
	const setLoggedIn = useStoreActions((actions) => actions.login.setLoggedIn)
	const loggedIn = useStoreState((state) => state.login.loggedIn)

	const [startDate, setStartDate] = useState()
	const [endDate, setEndDate] = useState()

	useEffect(() => {
		if (nextbnb_session) {
		  setLoggedIn(true)
		}
	  }, [])

	return (
	  <Layout
		content={
		  <div className="container">
			<Head>
			  <title>{house.title}</title>
			</Head>
			<article>
			  <img src={house.picture} width="100%" alt="House picture" />
			  <p>
				{house.type} - {house.town}
			  </p>
			  <p>{house.title}</p>
			</article>
			<aside>
            	<h2>Choose a date</h2>
            	<DateRangePicker datesChanged={(startDate, endDate) => {
					setNumberOfNightsBetweenDates(
						calcNumberOfNightsBetweenDates(startDate, endDate)
					)
					setDateChosen(true)
					setStartDate(startDate)
    				setEndDate(endDate)
				}}
				bookedDates={bookedDates}
				/>

				<div>
					<h2>Price per night</h2>
					<p>${house.price}</p>
				</div>
				{
				dateChosen && (
					<div>
					
					<h2>Total price for booking</h2>
					<p>${(numberOfNightsBetweenDates * house.price).toFixed(2)}</p>
					{
						loggedIn ? (
							<button
								className="reserve"
								onClick={async () => {
									
									if (!(await canReserve(house.id, startDate, endDate))) {
										alert('The dates chosen are not valid')
										return
									}

									const sessionResponse = await axios.post('/api/stripe/session', {
										amount: house.price * numberOfNightsBetweenDates
									})
									if (sessionResponse.data.status === 'error') {
										alert(sessionResponse.data.message)
										return
									}
									  
									const sessionId = sessionResponse.data.sessionId
									const stripePublicKey = sessionResponse.data.stripePublicKey									  

									try {
										const response = await axios.post('/api/reserve', {
											houseId: house.id,
											startDate,
											endDate,
											sessionId
										})

										const stripe = Stripe(stripePublicKey)
										const { error } = await stripe.redirectToCheckout({
  											sessionId
										})

									if (response.data.status === 'error') {
										alert(response.data.message)
										return
									}
									console.log(response.data)
									} catch (error) {
									console.log(error)
									return
									}
								}}
								>
								Reserve
								</button>
						) : (
							<button
							className="reserve"
							onClick={() => {
								setShowLoginModal()
							}}
							>
							Log in to Reserve
							</button>
						)
						}
					</div>
				)
				}
       		</aside>

			<style jsx>{`
				.container {
					display: grid;
					grid-template-columns: 60% 40%;
					grid-gap: 30px;
				}

				aside {
					border: 1px solid #ccc;
					padding: 20px;
				}

				button {
					background-color: rgb(255, 90, 95);
					color: white;
					font-size: 13px;
					width: 100%;
					border: none;
					height: 40px;
					border-radius: 4px;
					cursor: pointer;
				  }
				`}</style>
						</div>
						}
			/>
	)
  }

const calcNumberOfNightsBetweenDates = (startDate, endDate) => {
	const start = new Date(startDate) //clone
	const end = new Date(endDate) //clone
	let dayCount = 0
  
	while (end > start) {
	  dayCount++
	  start.setDate(start.getDate() + 1)
	}
  
	return dayCount
  }

export async function getServerSideProps({ req, res, query }) {
	const { id } = query
	const cookies = new Cookies(req, res)
	const nextbnb_session = cookies.get('nextbnb_session')
	const house = await HouseModel.findByPk(id)
	const bookedDates = await getBookedDates(id)

	return {
	  props: {
		house: house.dataValues,
		nextbnb_session: nextbnb_session || null,
		bookedDates: bookedDates || []
	  }
	}
} 

const getBookedDates = async (id) => {
	try {
	  const response = await axios.post(
		'http://localhost:3000/api/houses/booked',
		{ houseId: id }
	  )
	  if (response.data.status === 'error') {
		alert(response.data.message)
		return
	  }
	  return response.data.dates
	} catch (error) {
	  console.error(error)
	  return
	}
  }

const canReserve = async (houseId, startDate, endDate) => {
	try {
	  const response = await axios.post(
		'http://localhost:3000/api/houses/check',
		{ houseId, startDate, endDate }
	  )

	  console.log(response.data);

	  if (response.data.status === 'error') {
		alert(response.data.message)
		return
	  } else  if (response.data.message === 'busy') 
	    return false
	  
	  return true
	} catch (error) {
	  console.error(error)
	  return
	}
  }