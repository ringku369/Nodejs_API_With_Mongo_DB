const Category = require('../model/categoryModel');
const dotenv = require('dotenv');
dotenv.config({});
const data = {}

data.show = async (req, res) => {

    const id = req.query.id;
    if (id) {

        const categoryData = await Category.findOne({
            _id: id,
            status: true
        });
        try {
            const {
                ...others
            } = categoryData._doc;
            return res.status(200).json(others);
        } catch (err) {
            return res.status(500).json({
                error: err.message || "Error Occurred while retriving category information"
            })
        }

    } else {
        const categoryData = await Category.aggregate([{
                $lookup: {
                    from: 'users',
                    localField: 'user_id', // Main tabel foreign key
                    foreignField: '_id', // Secondary table primary key
                    as: 'user'
                }
            },

            //{$project : {'users.name':true,'users._id':true,title:true}},
            {
                $unwind: '$user'
            }

        ]);
        try {
            return res.status(200).json(categoryData);
            //const { ...others} = categoryData._doc;

        } catch (error) {
            return res.status(500).json({
                error: error.message || "Error Occurred while retriving category information"
            })
        }
    }

}

data.one = (req, res) => {
    const id = req.params.id;
    Category.findOne({
            _id: id,
            status: true
        }, {
            title: true,
            user_id: true,
            updatedAt: true,
            createdAt: true,
            status: true
        })
        .then(category => {
            return res.status(200).json(category);
        })
        .catch(err => {
            return res.status(500).json({
                error: err.message || "Error Occurred while retriving category information"
            })
        })
}

data.create = async (req, res) => {

    if (!req.body) {
        return res.status(400).json([{
            'error': 'Data to cteate can not be empty'
        }]);
    }
    const checkCategory = await Category.findOne({
        'title': req.body.title
    }).count();
    try {
        if (checkCategory == 0) {
            const newCategory = new Category({
                title: req.body.title,
                user_id: req.body.user_id
            });
            const saveCategory = await newCategory.save();
            const {
                password,
                ...others
            } = saveCategory._doc;
            return res.status(201).json(others);

        } else {
            return res.status(404).json([{
                'error': 'Duplicate entry is not allowed'
            }]);
        }

    } catch (err) {
        return res.status(500).json({
            error: err.message || "Error create category information"
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
        if (req.body.title) return res.status(400).json({
            error: 'Title filed is not allowed'
        });
        const result = await Category.updateMany({
            status: true
        }, {
            $set: req.body
        });
        if (result.modifiedCount == 0) return res.status(400).json({
            error: 'no data found'
        });
        return res.status(200).json({
            success: "All category has been updated successfully!"
        });

    } else {
        Category.findByIdAndUpdate(id, req.body, {
                useFindAndModify: false
            })
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        error: `Cannot Update category with ${id}. Maybe category not found!`
                    })
                } else {
                    return res.json(data)
                }
            })
            .catch(err => {
                return res.status(500).json({
                    error: "Error Update category information"
                })
            })
    }
}


data.delete = async (req, res) => {
    const id = req.params.id;
    if (id == 'all') {
        const result = await Category.deleteMany({
            status: true
        });
        if (result.deletedCount == 0) return res.status(400).json({
            error: 'no data found'
        });
        return res.status(200).json({
            success: "All category has been deleted successfully!"
        });

    } else {
        Category.findByIdAndDelete(id)
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        error: `Cannot Delete with id ${id}. Maybe id is wrong`
                    });
                } else {
                    return res.status(200).json({
                        success: "Category has been deleted successfully!"
                    });
                }
            })
            .catch(err => {
                return res.status(500).json({
                    error: "Could not delete Category with id=" + id
                });
            });
    }

}

module.exports = data;