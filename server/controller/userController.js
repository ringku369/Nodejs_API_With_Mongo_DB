const User = require('../model/userModel');
const CryptoJS = require("crypto-js");
const Crypto = require("crypto");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config({});

const data = {}



data.show = async (req,res) => {
    
    const id = req.query.id;
    if (id) {

        const usserData = await User.findOne({_id:id, status:true });
        try {
            const { ...others} = usserData._doc;
            return res.status(200).json(others);
        } catch (error) {
            return res.status(500).json({ error : err.message || "Error Occurred while retriving user information" })
        }
        
    } else {
        User.find({status:true })
            .then(user => {
                return res.status(200).json(user);
            })
            .catch(err => {
                return res.status(500).json({ error : err.message || "Error Occurred while retriving user information" })
            })
    }
    
}

data.one = (req,res) => {
    const id = req.params.id;
    User.findOne({_id:id, status:true },{name:true,email:true,updatedAt:true,createdAt:true,status:true,gender:true,isAdmin:true})
            .then(user => {
                return res.status(200).json(user);
            })
            .catch(err => {
                return res.status(500).json({ error : err.message || "Error Occurred while retriving user information" })
            })
}

data.create = async (req,res) => {
    
    if(!req.body){
        return res.status(400).json([{'error' : 'Data to cteate can not be empty'}]);
    }
    const checkUser = await User.findOne({'email':req.body.email});
    try {
        if (!checkUser) {
            
            // Encrypt
            const encPassword = CryptoJS.AES.encrypt(req.body.password, process.env.SKEY).toString();

            const newUser = new User ({
                name : req.body.name,
                email : req.body.email,
                password : encPassword,
            });
            const saveUser = await newUser.save();

            const {password, ...others} = saveUser._doc;
            return res.status(201).json(others);

        } else {
            return res.status(404).json([{'error' : 'Duplicate entry is not allowed'}]);
        }
        
    }catch (err) {
        return res.status(500).json({error : err.message || "Error create user information"});
    }
}

data.update = async (req,res) => {
    
    if(!req.body){
        return res
            .status(400).json([{'error' : 'Data to cteate can not be empty'}]);
    }
    const id = req.params.id;
    if (id =='all') {
        if(req.body.email) return res.status(400).json({error : 'Email filed is not allowed'});
        const result = await User.updateMany({status:true},{$set:req.body});
        if(result.modifiedCount == 0) return res.status(400).json({error : 'no data found'});
        return res.status(200).json({success : "All user has been updated successfully!"});

    }else{
        User.findByIdAndUpdate(id, req.body, { useFindAndModify: false})
            .then(data => {
                if(!data){
                    return res.status(404).json({ error : `Cannot Update user with ${id}. Maybe user not found!`})
                }else{
                  return res.json(data)
                }
            })
            .catch(err =>{
               return res.status(500).json({ error : "Error Update user information"})
            })
    }
}


data.delete = async (req,res) => {
    const id = req.params.id;
    if (id =='all') {
        const result = await User.deleteMany({status:true});
        if(result.deletedCount == 0) return res.status(400).json({error : 'no data found'});
        return res.status(200).json({success : "All user has been deleted successfully!"});

    } else {
        User.findByIdAndDelete(id)
            .then(data => {
                if(!data){
                    return res.status(404).json({ error : `Cannot Delete with id ${id}. Maybe id is wrong`});
                }else{
                    return res.status(200).json({success : "User has been deleted successfully!"});
                }
            })
            .catch(err =>{
                return res.status(500).json({error: "Could not delete User with id=" + id});
            });
    }

}




data.login = async (req,res) => {
    
    if(!req.body){
        return res.status(400).json([{'error' : 'User data can not be empty'}]);
    }
    
    const checkUser = await User.findOne({'email':req.body.email},{name:true,email:true,password:true,isAdmin:true});
    if(!checkUser) return res.status(404).json([{'error' : 'email or password does not match'}]);
    // Decrypt Password
    const bytes  = CryptoJS.AES.decrypt(checkUser.password, process.env.SKEY);
    const dbPassword = bytes.toString(CryptoJS.enc.Utf8);

    if(req.body.password != dbPassword) return res.status(404).json([{'error' : 'email or password does not match'}]);
    
    const accessToken = jwt.sign(
        {id : checkUser._id, isAdmin : checkUser.isAdmin},
        process.env.SKEY,
        {expiresIn : '5m'}
    );
    
    
    const {password, ...others} = checkUser._doc;
    return res.status(200).json({...others,accessToken});
}

data.jwt_test = (req,res) => {
    
    res.send(`This is jwt test route`);
}



module.exports = data;