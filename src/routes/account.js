import ControllerAccount from '../controller/accountController.js';
import express from 'express'

let apiAccount= express.Router();

apiAccount.get('/accounts', ControllerAccount.get_account);


export default apiAccount;