var express=require("express");
var router=express.Router();
const mongoose=require("mongoose");

//get page model
var Page=require("../models/page");

//get subpage model
var Subpage=require("../models/subpage");

//get tableschema model
var Table=require("../models/tableschema");

//get fieldschema model
var Field=require("../models/fieldschema");

//get tablestring model
var StringTable=require("../models/table_type_string");

//get tablenumber model
var NumberTable=require("../models/table_type_number");

//get date table model
var DateTable=require("../models/table_type_date");

//get time table model
var TimeTable=require("../models/table_type_time");

//get date and time table model
var DnTTable=require("../models/table_type_dnt");

//get file table model
var FileTable=require("../models/table_type_file");


//GET request from /
router.get("/",function(req,res){
	

	Page.findOne({slug:"home"},function(err, page){
		if(err){
			req.flash("denger","Home Page Not Found In DataBase.");
			res.redirect("/user/login");
		}
		
		else{
		res.redirect("/home");
		}
	});
});

router.get("/:slug",function(req,res){
	console.log("slug: ");
	var slug=req.params.slug;
	Page.findOne({slug:slug},function(err, p){
		if(err){
			console.log("error while getting page");
		}
		if(!p){
			res.redirect("/");
		}
		else{
			Subpage.find({page:p.slug},function(err,subpages){
				if(subpages){
					
					res.render('index',{
					title:p.title,
					content:p.content,
					slug:p.slug,
					subpages:subpages,
					doc_title:"",
					tablename:"",
					img:"",
					tImg:"",
					tableid:"",
				});
				}
				else
					res.render('index',{
					title:p.title,
					content:p.content,
					slug:p.slug,
					subpages:[],
					doc_title:"",
					tablename:"",
					img:"",
					tImg:"",
					tableid:"",
				});
			});
			
		}
	});
	
	
});


router.get("/:slug/:subpage",function(req,res){
	var slug=req.params.slug;
	var subpage=req.params.subpage;
	Subpage.findOne({slug:subpage},function(err, p){
		
		if(err){
			console.log("error while getting page");
		}
		if(!p){
			res.redirect("/");
		}
		
		else{
			console.log("subpage: ");
			var tableid=p.slug+"-"+p.table_name;
			
			Field.findOne({table_id:tableid,key:true},function(err, pkey){
				var model;
				if(pkey){
				switch(pkey.datatype) {
					case "Text":
						model=StringTable;
					break;
					case "Number":
						model=NumberTable;
					break;
					case "Date":
						model=DateTable;
					break;
					case "Time":
						model=TimeTable;
					break;
					case "datetime-local":
						model=DnTTable;
					break;
				}
				model.find({table_id:tableid, name:pkey.name},function(err, docs){
					var docval=[];
					var docid = [];
					var imgs=[];
					docs.forEach(function(doc){
						docval.push(doc.value);
						docid.push(doc.doc_id);
						console.log(docid);
					});
						FileTable.find({table_id:tableid},function(err,files){
							
							files.forEach(function(file){
								var flag = 0, counter = 0;
								docid.forEach(function(doc){
									console.log(docval + "docID in DB: " + doc + "FileDoc: " + file.doc_id);
									if(file.doc_id===doc)
									{
											counter++;
											flag =1;
											imgs.push(file.value);
											console.log(file.value + " " + doc);
									}
									else if(flag == 0 && counter > 0) {
										imgs.push("undefined");
									}
									
								});
								console.log("file value : "+imgs);
							});
							console.log("file value1 : "+imgs);
							console.log(imgs + " " + docid + " ");
						res.render('index',{
							title:p.title,
							content:p.content,
							slug:p.slug,
							subpages:[],
							doc_title:docval,
							tablename:p.table_name,
							tableid:tableid,
							img:p.img,
							tImg:imgs,
							doc_id: docid
						});
						});
						
					});
				
				}
				else{
					res.render('index',{
							title:p.title,
							content:p.content,
							slug:p.slug,
							subpages:[],
							doc_title:[],
							tablename:'',
							tableid:'',
							img:p.img,
							tImg:''
						});
				}
			});
				
				
		}
			
		
	});	
});

//GET request from /
router.get("/:slug/:subpage/:tableName/:doc_id",function(req,res){
	
	var tableid=req.params.subpage+"-"+req.params.tableName;
	var doc_id=req.params.doc_id;
	var values=[];
	var visuals=[],files=[];
	console.log(tableid);
	console.log(doc_id);
		
		StringTable.find({table_id:tableid,doc_id:doc_id},function(err,docs){
			if(docs!="undefined" && docs!=[])
				values=docs;
			NumberTable.find({table_id:tableid,doc_id:doc_id},function(err,docs2){
				if(docs2!="undefined" && docs2!=[])
					values=values.concat(docs2);
				DateTable.find({table_id:tableid,doc_id:doc_id},function(err,docs3){
					if(docs3!="undefined" && docs3!=[])
						values=values.concat(docs3);
					TimeTable.find({table_id:tableid,doc_id:doc_id},function(err,docs4){
						if(docs4!="undefined" && docs4!=[])
							values=values.concat(docs4);
						DnTTable.find({table_id:tableid,doc_id:doc_id},function(err,docs5){
							if(docs5!="undefined" && docs5!=[])
								values=values.concat(docs5);
							FileTable.find({table_id:tableid,doc_id:doc_id},function(err,docs6){
								
								if(docs6!="undefined" && docs6!=[] && docs6!=null)
								{
									var visualExtensions =/(\.jpg|\.jpeg|\.png|\.gif|\.jfif|\.mp4|\.webm|\.ogg|\.mp3|\.wma|\.midi)$/i;
									docs6.forEach(function(d6){
										if(visualExtensions.exec(d6.value))
										{
											visuals.push(d6.value);
										}
										else
											values.push(d6);
									});
									
								}
							console.log("visuals value: "+visuals);
							console.log("file : "+files);
							console.log("values: "+ values);
							res.render('tableindex',{
								title:req.params.doc_id,
								values:values,
								visuals:visuals,
								tableid:tableid,
								docname:doc_id
							});
				});
		});	
		});
		});	
			});
		});	
	
});

//Exports
module.exports=router;