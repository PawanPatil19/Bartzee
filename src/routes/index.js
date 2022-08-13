var express = require("express");
var path = require("path");
var User = require("../models/userModel");
var Product = require("../models/productModel");
var Org = require("../models/orgModel");
var Chat = require("../models/chatModel");
var Notif = require("../models/notificationModel")
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
const flash = require('connect-flash');
var session = require("express-session");
var cookieParser = require("cookie-parser");
var fs = require("fs")
var ObjectId = require('mongodb').ObjectID;
var Auth0Strategy = require("passport-auth0");
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth')
var mongo = require('mongodb');
var XLSX = require('xlsx');

var MongoClient = mongo.MongoClient;



// setting up multer to stroing uploaded images
var multer = require('multer');
const { Template } = require("ejs");
var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'src/uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});
var upload = multer({ storage: storage });


//login page
router.get('/', (req, res) => {
	//console.log("1: ", req.user)
	Product.find({ 'buyer': null }).sort({ _id: -1 }).exec(function (err, product) {
		if (req.user) {
			Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }]}).exec(function (err, numberOfOrders) {
				if (err) {
					console.log("Error:", err);
				}
				var cnt = numberOfOrders.length

				Notif.find({ 'email': req.user.email }, function (err, msg) {
					res.render("index", {
						layout: false,
						search: null, product: product, user: req.user, count: cnt, msg: msg
					});
				})
			});
		} else {
			res.render("index", { layout: false, search: null, product: product, user: req.user, count: 0, search: null, msg: null });
		}
	});
})


//Organization Registration page
router.get("/orgReg", (req, res) => {
	res.render("orgReg");
})

//Post Organization Registration
router.post("/orgReg", async (req, res) => {
	const { org, country } = req.body

	try {
		const response = await Org.create({
			org,
			country
		})
		console.log('Organization Registered ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Organization already registered..' })
		}
		throw error
	}

	Org.find({}).exec(function (err, Organization) {

		if (err) {
			console.log("Error:", err);
		}

		res.render("register", { Organization: Organization });
	});
	//res.json({ status: 'ok' })
});

// Product Registration Page
router.get("/productReg", ensureAuthenticated, (req, res) => {
	Org.find({}).exec(function (err, Organization) {
		if (err) {
			console.log("Error:", err);
		}
		Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }).exec(function (err, numberOfOrders) {
			if (err) {
				console.log("Error:", err);
			}
			Notif.find({ 'email': req.user.email }, function (err, msg) {
				res.render("productReg", { msg: msg, Organization: Organization, layout: false, user: req.user, count: numberOfOrders.length });

			})
		});

	});
})

//Post Product registration
router.post("/productReg", upload.single('image'), (req, res) => {
	console.log(req.file)

	var img = fs.readFileSync(req.file.path);
	var encode_img = img.toString('base64');

	var obj = {
		productType: req.body.productType,
		sellerName: req.body.sellerName,
		organization: req.body.organization,
		sellerAddress: req.body.sellerAddress,
		productName: req.body.productName,
		image: {
			data: fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename)),
			contentType: 'image/jpg'
		},
		productQuantity: req.body.productQuantity,
		productDesc: req.body.productDesc,
		productColor: req.body.productColor,
		productSize: req.body.productSize,
		sellerPhone: req.body.sellerPhone,
		sellerEmail: req.body.sellerEmail,
		productPrice: req.body.productPrice,
	}



	Product.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
			item.save();

			Product.find({ '_id': item._id }).exec(function (err, prd) {
				if (err) {
					console.log(err);
				}
				Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }).exec(function (err, numberOfOrders) {
					if (err) {
						console.log("Error:", err);
					}



					Notif.find({ 'email': req.user.email }, function (err, msg) {
						res.render('review', { msg: msg, prd: prd, layout: false, user: req.user, count: numberOfOrders.length });
					})
				});

			})
		}
	});

});

// Product Review page after registration
router.get("/review", (req, res) => {
	Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }).exec(function (err, numberOfOrders) {
		if (err) {
			console.log("Error:", err);
		}
		Notif.find({ 'email': req.user.email }, function (err, msg) {
			res.render("review", { msg: msg, layout: false, user: req.user, count: numberOfOrders.length });
		})
	});
})

// Product review page
router.get("/review/:id", (req, res) => {

	Product.find({ '_id': req.params.id }).exec(function (err, prd) {
		if (req.user) {
			Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }).exec(function (err, numberOfOrders) {
				if (err) {
					console.log("Error:", err);
				}
				Notif.find({ 'email': req.user.email }, function (err, msg) {
					res.render("review", { msg: msg, prd: prd, layout: false, user: req.user, count: numberOfOrders.length });
				})
			});
		} else {
			for (var i in prd) {
				var obj = {
					email: prd[i].sellerEmail,
					notif: 'Someone viewed your item'
				}
				Notif.create(obj, (err, item) => {
					if (err) {
						console.log(err)
					}
				})
			}
			res.render('review', { prd: prd, layout: false, user: req.user, count: 0, msg: null, notifCount: 0 });
		}

	})
})

router.post("/review/:id", (req, res) => {
	Product.updateOne({ '_id': req.params.id }, { buyer: req.user._id, buyerName: req.user.name }, function (err, docs) {
		if (err) {
			console.log(err)
		}
		else {
			Product.find({ '_id': req.params.id }, function (err, prd) {
				for (var i in prd) {
					var obj = {
						email: prd[i].sellerEmail,
						notif: `${req.user.name} had added your item to cart`
					}
					Notif.create(obj, (err, item) => {
						if (err) {
							console.log(err)
						}
					})
				}
			})
			Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }).exec(function (err, numberOfOrders) {
				if (err) {
					console.log("Error:", err);
				}
				Notif.find({ 'email': req.user.email }, function (err, msg) {
					res.render("cart", { notifCount: msg.length, msg: msg, orders: numberOfOrders, layout: false, user: req.user, count: numberOfOrders.length });
				})
			});

		}
	});

})

// Cart page
router.get("/cart", (req, res) => {
	Product.find({ $and: [{ "buyer": req.user._id },
	{ 'orderStatus': {$lt: 2} }] }, function (err, orders) {
		if (err) {
			console.log(err)
		}
		Notif.find({ 'email': req.user.email }, function (err, msg) {
			res.render('cart', { notifCount: msg.length, msg: msg, orders: orders, layout: false, user: req.user, count: orders.length, search: null });
		})
	});

})

// Buyer Cart Order Completion

router.get("/buyerOrderCompletion/:productID", function (req, res) {
	Product.find({ '_id': req.params.productID }, function (err, product) {
		for (var i in product) {

			if (product[i].orderStatus == 0) {
				Product.updateOne({ '_id': req.params.productID }, { orderStatus: product[i].orderStatus + 1 }, function (err, docs) {
					console.log("Order Status Updated")
				})
				Product.find({ 'buyer': req.user._id }, function (err, orders) {
					if (err) {
						console.log(err)
					}
					Notif.find({ 'email': req.user.email }, function (err, msg) {
						res.render('cart', { notifCount: msg.length, msg: msg, orders: orders, layout: false, user: req.user, count: orders.length, search: null });
					})
				});
			}
			if (product[i].orderStatus == 1) {
				var myquery = { roomID: req.params.productID };
				Chat.remove(myquery, (err, doc) => {
					if (err) {
						console.log(err)
					} else {
						console.log('Chats deleted for the product')
					}
				})

				Product.updateOne({ '_id': req.params.productID }, { orderStatus: product[i].orderStatus + 1 }, function (err, docs) {
					
						
						Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
							if (err) {
								console.log(err)
							} else {
								Product.find({ 'sellerEmail': req.user.email }, function (err, sellItems) {
									if (err) {
										console.log(err);
									} else {
										Notif.find({ 'email': req.user.email }, function (err, msg) {
											res.render('sellCart', { msg: msg, layout: false, user: req.user, count: orders.length, sellItems: sellItems });
										})
									}
								})

							}

						});
					})
				
			}


		}
	})
})



// Profile page
router.get("/profile", (req, res) => {
	Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
		if (err) {
			console.log(err)
		}
		Notif.find({ 'email': req.user.email }, function (err, msg) {
			User.find({ '_id': req.user._id }, function (err, user) {
				res.render('profile', { msg: msg, layout: false, user: user, count: orders.length });
			})
		})
	});
})

router.get("/profile/:id", (req, res) => {
	User.find({ '_id': req.params.id }, function (err, user) {
		res.render('profile', { msg: null, layout: false, user: user, count: 0 })
	})
})

router.post("/profile", upload.single("image"), function (req, res) {
	var img = fs.readFileSync(req.file.path);
	var encode_img = img.toString('base64');
	var image = {
		data: fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename)),
		contentType: 'image/jpg'
	}


	var myquery = { _id: req.user._id };
	var newvalues = { $set: { image: image } };
	User.updateOne(myquery, newvalues, function (err, docs) {
		if (err) {
			console.log(err)
		} else {
			console.log("Profile Picture updated successfully!")
			User.find({ _id: req.user._id }).exec((err, user) => {
				if (err) {
					console.log(err);
				} else {
					Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
						Notif.find({ 'email': req.user.email }, function (err, msg) {
							res.render('profile', { layout: false, user: user, count: orders.length, msg: msg });
						})
					});
				}
			})
		}
	})
})


//Delete user
router.get("/deleteUser", function (req, res) {
	User.findByIdAndRemove(req.user._id, (err, doc) => {
		if (!err) {
			Product.find({}).exec(function (err, product) {
				if (err) {
					console.log("Error:", err);
				}
				res.render("index", { layout: false, product: product, search: null, user: null, count: 0, msg: null });

			});
		} else {
			console.log('Failed to Delete user Details: ' + err);
		}
	});

});

//Delete user with id for admin purpose
router.get("/deleteUser/:id", function (req, res) {
	User.findByIdAndRemove(req.params.id, (err, doc) => {
		User.find({}).exec(function (err, users) {
			Product.find({}).exec(function (err, products) {
				Product.find({ 'buyer': { $ne: null } }).exec(function (err, orders) {
					Org.find({}).exec(function (err, orgs) {
						res.render("admin", {
							users: users,
							userCount: users.length,
							products: products,
							productCount: products.length,
							orders: orders,
							orderCount: orders.length,
							orgs: orgs,
							orgCount: orgs.length
						})
					})

				})

			})

		})
	});

});


//Remove product from user cart
router.get("/removeCart/:id", function (req, res) {
	var myquery = { roomID: req.params.id };
	Chat.remove(myquery, (err, doc) => {
		if (err) {
			console.log(err)
		} else {
			console.log('Chats deleted for the product')
		}
	})


	Product.updateOne({ '_id': req.params.id }, { buyer: null, buyerName: null }, function (err, docs) {
		if (err) {
			console.log(err)
		}
		else {
			console.log("Item removed from cart! ", docs);
			Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
				Notif.find({ 'email': req.user.email }, function (err, msg) {
					res.render('cart', { orders: orders, layout: false, user: req.user, count: orders.length, msg: msg });
				})
			});

		}
	});
});

// Chat Interface
router.get("/chatInterface/:roomID", function (req, res) {
	var room = req.params.roomID;

	Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
		if (err) {
			console.log(err)
		}
		Product.find({ '_id': req.params.roomID }, function (err, prd) {
			for (var i in prd) {
				var obj = {
					email: prd[i].sellerEmail,
					notif: `${req.user.name} has sent you a message`
				}
				Notif.create(obj, (err, item) => {
					if (err) {
						console.log(err)
					}
				})
			}
		})

		Notif.find({ 'email': req.user.email }, function (err, msg) {
			res.render('chatInterface', { layout: false, room: room, user: req.user, count: orders.length, msg: msg });
		})
	});
});

// Sell Cart
router.get("/sellCart", (req, res) => {
	Product.find({ $and: [{ "buyer": req.user._id },
	{ 'orderStatus': {$lt: 2} }]}, function (err, orders) {
		if (err) {
			console.log(err)
		} else {
			Product.find({ 'sellerEmail': req.user.email }, function (err, sellItems) {
				if (err) {
					console.log(err);
				} else {
					Notif.find({ 'email': req.user.email }, function (err, msg) {
						res.render('sellCart', { msg: msg, layout: false, user: req.user, count: orders.length, sellItems: sellItems });
					})
				}
			})

		}

	});

})

// Seller Order Completion
router.get("/sellerOrderCompletion/:productID", function (req, res) {
	Product.find({ '_id': req.params.productID }, function (err, product) {
		for (var i in product) {

			if (product[i].orderStatus == 0) {
				Product.updateOne({ '_id': req.params.productID }, { orderStatus: product[i].orderStatus + 1 }, function (err, docs) {
					console.log("Order Status Updated")
				})
				Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
					if (err) {
						console.log(err)
					} else {
						Product.find({ 'sellerEmail': req.user.email }, function (err, sellItems) {
							if (err) {
								console.log(err);
							} else {
								Notif.find({ 'email': req.user.email }, function (err, msg) {
									res.render('sellCart', { msg: msg, layout: false, user: req.user, count: orders.length, sellItems: sellItems });
								})
							}

						})

					}

				});
			}
			if (product[i].orderStatus == 1) {
				var myquery = { roomID: req.params.productID };
				Chat.remove(myquery, (err, doc) => {
					if (err) {
						console.log(err)
					} else {
						console.log('Chats deleted for the product')
					}
				})

				Product.updateOne({ '_id': req.params.productID }, { orderStatus: product[i].orderStatus + 1 }, function (err, docs) {
					
						console.log("Order Completed!")
						Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
							if (err) {
								console.log(err)
							} else {
								Product.find({ 'sellerEmail': req.user.email }, function (err, sellItems) {
									if (err) {
										console.log(err);
									} else {
										Notif.find({ 'email': req.user.email }, function (err, msg) {
											res.render('sellCart', { msg: msg, layout: false, user: req.user, count: orders.length, sellItems: sellItems });
										})
									}
								})

							}

						});
					})
				
			}


		}
	})
})


//Delete Item to sell
router.get("/deleteItem/:id", (req, res) => {
	var myquery = { roomID: req.params.id };
	Chat.remove(myquery, (err, doc) => {
		if (err) {
			console.log(err)
		} else {
			console.log('Chats deleted for the product')
		}
	})

	Product.findByIdAndRemove(req.params.id, (err, doc) => {
		if (err) {
			console.log(err);
		} else {
			console.log("Product Deleted!")
			Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
				if (err) {
					console.log(err)
				} else {
					Product.find({ 'sellerEmail': req.user.email }, function (err, sellItems) {
						if (err) {
							console.log(err);
						} else {
							Notif.find({ 'email': req.user.email }, function (err, msg) {
								res.render('sellCart', { msg: msg, layout: false, user: req.user, count: orders.length, sellItems: sellItems });
							})
						}
					})

				}

			});
		}
	})
})


//Deletion by admin
router.get("/deleteItemByAdmin/:id", (req, res) => {
	var myquery = { roomID: req.params.id };
	Chat.remove(myquery, (err, doc) => {
		if (err) {
			console.log(err)
		} else {
			console.log('Chats deleted for the product')
		}
	})

	Product.findByIdAndRemove(req.params.id, (err, doc) => {
		User.find({}).exec(function (err, users) {
			Product.find({}).exec(function (err, products) {
				Product.find({ 'buyer': { $ne: null } }).exec(function (err, orders) {
					Org.find({}).exec(function (err, orgs) {
						res.render("admin", {
							users: users,
							userCount: users.length,
							products: products,
							productCount: products.length,
							orders: orders,
							orderCount: orders.length,
							orgs: orgs,
							orgCount: orgs.length
						})
					})

				})

			})

		})
	})
})


//Edit user page
router.get("/updateProfile", (req, res) => {
	Org.find({}).exec(function (err, Organization) {
		if (err) {
			console.log("Error:", err);
		}
		res.render("updateProfile", { user: req.user, Organization: Organization });
	});

})

// Edit user profile 
router.post("/updateProfile", async (req, res) => {
	const { name, email, phone, organization } = req.body


	let errors = [];

	if (!name || !email || !phone || !organization) {
		errors.push({ msg: "Please fill in all fields" })
	}

	if (errors.length > 0) {
		res.render('error')
	} else {
		var myquery = { _id: req.user._id };
		var newvalues = { $set: { name: name, email: email, phone: phone, organization: organization } };
		User.updateOne(myquery, newvalues, function (err, docs) {
			if (err) {
				console.log(err)
			} else {
				console.log("User Profile updated successfully!")
				User.findOne({ _id: req.user._id }).exec((err, user) => {
					if (err) {
						console.log(err);
					} else {
						Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
							Notif.find({ 'email': req.user.email }, function (err, msg) {
								User.find({ '_id': req.user._id }, function (err, user) {
									res.render('profile', { layout: false, user: user, count: orders.length, msg: msg });
								})
							})
						});
					}
				})
			}
		})
	}
})



// Edit product details
router.get("/editProduct/:id", (req, res) => {
	Org.find({}).exec(function (err, Organization) {
		if (err) {
			console.log("Error:", err);
		}
		Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }).exec(function (err, numberOfOrders) {
			if (err) {
				console.log("Error:", err);
			}
			Product.find({ '_id': req.params.id }).exec(function (err, product) {
				if (err) {
					console.log(err);
				}
				Notif.find({ 'email': req.user.email }, function (err, msg) {
					res.render("editProduct", { msg: msg, product: product, Organization: Organization, layout: false, user: req.user, count: numberOfOrders.length });
				})
			})
		});

	});
})


router.post("/editProduct/:id", async (req, res) => {
	// var img = fs.readFileSync(req.file.path);
	// var encode_img = img.toString('base64');

	var obj = {
		productType: req.body.productType,
		sellerName: req.body.sellerName,
		organization: req.body.organization,
		sellerAddress: req.body.sellerAddress,
		productName: req.body.productName,
		// image: {
		// 	data: fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename)),
		// 	contentType: 'image/jpg'
		// },
		productQuantity: req.body.productQuantity,
		productDesc: req.body.productDesc,
		productColor: req.body.productColor,
		productSize: req.body.productSize,
		sellerPhone: req.body.sellerPhone,
		productPrice: req.body.productPrice,
	}

	var myquery = { _id: req.params.id };
	var newvalues = {
		$set: {
			productName: obj.productName,
			sellerName: obj.sellerName,
			sellerPhone: obj.sellerPhone,
			sellerAddress: obj.sellerAddress,
			organization: obj.organization,
			productType: obj.productType,
			productColor: obj.productColor,
			productDesc: obj.productDesc,
			productPrice: obj.productPrice,
			productQuantity: obj.productQuantity,
			productSize: obj.productSize
		}
	};
	Product.updateOne(myquery, newvalues, function (err, docs) {
		if (err) {
			console.log(err)
		} else {
			console.log("Product Details updated successfully!: ", docs)
			Product.find({ $and : [{'buyer': req.user._id, 'orderStatus': {$lt:2}  }] }, function (err, orders) {
				if (err) {
					console.log(err)
				} else {
					Product.find({ 'sellerEmail': req.user.email }, function (err, sellItems) {
						if (err) {
							console.log(err);
						} else {
							Notif.find({ 'email': req.user.email }, function (err, msg) {
								res.render('sellCart', { msg: msg, layout: false, user: req.user, count: orders.length, sellItems: sellItems });
							})
						}
					})

				}

			});
		}



	})
})

router.get("/admin", function (req, res) {
	User.find({'admin' : null}).exec(function (err, users) {
		Product.find({}).exec(function (err, products) {
			Product.find({ 'buyer': { $ne: null } }).exec(function (err, orders) {
				Org.find({}).exec(function (err, orgs) {
					res.render("admin", {
						users: users,
						userCount: users.length,
						products: products,
						productCount: products.length,
						orders: orders,
						orderCount: orders.length,
						orgs: orgs,
						orgCount: orgs.length
					})
				})

			})

		})

	})
})


router.get('/exportUserData', (req, res) => {
	var wb = XLSX.utils.book_new(); //new workbook
	User.find((err, data) => {
		if (err) {
			console.log(err)
		} else {
			var temp = JSON.stringify(data);
			temp = JSON.parse(temp);
			var ws = XLSX.utils.json_to_sheet(temp);

			var down = path.join(__dirname, '..', '..', 'public', 'exportUserData.xlsx')
			XLSX.utils.book_append_sheet(wb, ws, "sheet1");
			XLSX.writeFile(wb, down);
			res.download(down);
		}
	});
});

router.get('/exportProductData', (req, res) => {
	var wb = XLSX.utils.book_new(); //new workbook
	Product.find((err, data) => {
		if (err) {
			console.log(err)
		} else {
			var temp = JSON.stringify(data);
			temp = JSON.parse(temp);
			var ws = XLSX.utils.json_to_sheet(temp);
			var down = path.join(__dirname, '..', '..', 'public', 'exportProductData.xlsx')
			XLSX.utils.book_append_sheet(wb, ws, "sheet1");
			XLSX.writeFile(wb, down);
			res.download(down);
		}
	});
});

router.get('/history/:id', function (req, res) {
	User.findOne({ '_id': req.params.id }, function (err, seller) {
		console.log("seller: ", seller.email)
		Product.find({$and: [{ 'orderStatus' : {$eq : 2}, 
			$or: [{ "buyer": req.params.id },
			{ 'sellerEmail': seller.email }]}]
		}, function (err, orders) {
			Notif.find({ 'email': req.user.email }, function (err, msg) {
				res.render('history', { notifCount: msg.length, msg: msg, orders: orders, layout: false, user: req.user, count: orders.length, search: null });
			})
		});
	})
})

router.get('deleteOrgByAdmin/:id', function(req, res) {
	Org.findByIdAndRemove(req.params.id, (err, doc) => {
		User.find({}).exec(function (err, users) {
			Product.find({}).exec(function (err, products) {
				Product.find({ 'buyer': { $ne: null } }).exec(function (err, orders) {
					Org.find({}).exec(function (err, orgs) {
						res.render("admin", {
							users: users,
							userCount: users.length,
							products: products,
							productCount: products.length,
							orders: orders,
							orderCount: orders.length,
							orgs: orgs,
							orgCount: orgs.length
						})
					})

				})

			})

		})
	})
})





router.get("/error", function (req, res) {
	res.render('error');
});

module.exports = router; 