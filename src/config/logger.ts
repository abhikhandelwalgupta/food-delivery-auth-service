import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
    level : 'info',
    format : winston.format.json(),
    defaultMeta : {serviceName : 'auth-service'},
    transports : [
        new winston.transports.Console({
            level : 'info',
            format : winston.format.simple()
        })
    ]
})




export default logger



if (Config.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()

    }))
}