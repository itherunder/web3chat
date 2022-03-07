
const proxy = process.env.PROXY

export default function handler(req, res) {
	res.status(200).json({ name: `proxy is ${proxy}` })
}