import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { providerRouter } from './provider.routes.js'
import { serviceRouter } from './service.routes.js'
import { uploadRouter } from './upload.routes.js'

const apiRouter = Router()

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/services', serviceRouter)
apiRouter.use('/provider', providerRouter)
apiRouter.use('/uploads', uploadRouter)

export { apiRouter }
