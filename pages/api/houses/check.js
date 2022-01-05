import { Booking } from '../../../model.js'
import { Sequelize } from 'sequelize'

const canBookThoseDates = async (houseId, startDate, endDate) => {
  debugger;
  console.log(startDate, endDate)
  const results = await Booking.findAll({
    where: {
      houseId: houseId,
      startDate: {
        [Sequelize.Op.lte]: new Date(endDate)
      },
      endDate: {
        [Sequelize.Op.gte]: new Date(startDate)
      }
    }
  })

  console.log(results);
  return !(results.length > 0)
}

export default async (req, res) => {
  debugger;
  if (req.method !== 'POST') {
    res.status(405).end() //Method Not Allowed
    return
  }
  const startDate = req.body.startDate
  const endDate = req.body.endDate
  const houseId = req.body.houseId

  let message = 'free'
  if (!(await canBookThoseDates(houseId, startDate, endDate))) {
    message = 'busy'
  }

  res.json({
    status: 'success',
    message: message
  })
}