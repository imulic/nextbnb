import { User, sequelize } from '../../../model.js'
import Cookies from 'cookies'

export default async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).end() //Method Not Allowed
    return
  }

  res.setHeader(
	"Set-Cookie",
	"nextbnb_session=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
  res.end();
  
}