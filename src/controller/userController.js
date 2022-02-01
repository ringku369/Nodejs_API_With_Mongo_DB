const User = require('../model/userModel');
const CryptoJS = require("crypto-js");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config({});

const data = {}



data.show = async (req, res) => {

    const id = req.query.id;
    if (id) {

        const usserData = await User.findOne({
            _id: id,
            status: true
        });
        try {
            const {
                ...others
            } = usserData._doc;
            return res.status(200).json(others);
        } catch (error) {
            return res.status(500).json({
                error: err.message || "Error Occurred while retriving user information"
            })
        }

    } else {
        // User.find({status:true })
        //     .then(user => {
        //         return res.status(200).json(user);
        //     })
        //     .catch(err => {
        //         return res.status(500).json({ error : err.message || "Error Occurred while retriving user information" })
        //     })

        const userData = await User.aggregate([

            {
                $match: {
                    'status': true
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id', // Main tabel foreign key
                    foreignField: 'user_id', // Secondary table primary key
                    pipeline: [{
                        $match: {
                            status: true
                        }
                    }],
                    as: 'catdatas'
                }
            },

            //{$project : {'users.name':true,'users._id':true,title:true}},
            //{$unwind : '$users' }

        ]).limit(5);
        try {
            return res.status(200).json(userData);
            //const { ...others} = userData._doc;

        } catch (error) {
            return res.status(500).json({
                error: error.message || "Error Occurred while retriving category information"
            })
        }
    }

}

data.one = (req, res) => {
    const id = req.params.id;
    User.findOne({
            _id: id,
            status: true
        }, {
            name: true,
            email: true,
            updatedAt: true,
            createdAt: true,
            status: true,
            gender: true,
            isAdmin: true
        })
        .then(user => {
            return res.status(200).json(user);
        })
        .catch(err => {
            return res.status(500).json({
                error: err.message || "Error Occurred while retriving user information"
            })
        })
}

data.create = async (req, res) => {

    if (!req.body) {
        return res.status(400).json([{
            'error': 'Data to cteate can not be empty'
        }]);
    }
    const checkUser = await User.findOne({
        'email': req.body.email
    });
    try {
        if (!checkUser) {

            // Encrypt
            const encPassword = CryptoJS.AES.encrypt(req.body.password, process.env.SKEY).toString();

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: encPassword,
            });
            const saveUser = await newUser.save();

            const {
                password,
                ...others
            } = saveUser._doc;
            return res.status(201).json(others);

        } else {
            return res.status(404).json([{
                'error': 'Duplicate entry is not allowed'
            }]);
        }

    } catch (err) {
        return res.status(500).json({
            error: err.message || "Error create user information"
        });
    }
}

data.update = async (req, res) => {

    if (!req.body) {
        return res
            .status(400).json([{
                'error': 'Data to cteate can not be empty'
            }]);
    }
    const id = req.params.id;
    if (id == 'all') {
        if (req.body.email) return res.status(400).json({
            error: 'Email filed is not allowed'
        });
        const result = await User.updateMany({
            status: true
        }, {
            $set: req.body
        });
        if (result.modifiedCount == 0) return res.status(400).json({
            error: 'no data found'
        });
        return res.status(200).json({
            success: "All user has been updated successfully!"
        });

    } else {
        User.findByIdAndUpdate(id, req.body, {
                useFindAndModify: false
            })
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        error: `Cannot Update user with ${id}. Maybe user not found!`
                    })
                } else {
                    return res.json(data)
                }
            })
            .catch(err => {
                return res.status(500).json({
                    error: "Error Update user information"
                })
            })
    }
}


data.delete = async (req, res) => {
    const id = req.params.id;
    if (id == 'all') {
        const result = await User.deleteMany({
            status: true
        });
        if (result.deletedCount == 0) return res.status(400).json({
            error: 'no data found'
        });
        return res.status(200).json({
            success: "All user has been deleted successfully!"
        });

    } else {
        User.findByIdAndDelete(id)
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        error: `Cannot Delete with id ${id}. Maybe id is wrong`
                    });
                } else {
                    return res.status(200).json({
                        success: "User has been deleted successfully!"
                    });
                }
            })
            .catch(err => {
                return res.status(500).json({
                    error: "Could not delete User with id=" + id
                });
            });
    }

}

module.exports = data;