(function($){
	
	var defaults = {
			$newModal:undefined,
			$editModal: undefined,
			loadAllUrl : '',
			addNewUrl : '',
			editUrl : '',
			deleteUrl : '',
			$btnNew : undefined,	
			$newForm:undefined,
			$editForm:undefined,
			template : undefined,
			$tableBody :undefined,
	
	};
	function Crud(options)
	{

		this.all =[];
		/*Indicate new or edit.
		 * if new = true then it is adding new
		 * */
		this.newMode  = false;


		this.init(options);
	}
	Crud.prototype.init = function (options)
	{
		$.extend(true,this,defaults,options);
		console.log("Options ",this);
		this.$newForm = this.$newModal.find("form");
		this.$editForm = this.$editModal.find("form");


		this.checkSettings();
		this.setUpEventHook();
		this.ajaxLoadAll();
	}
	
	/*
		Need to write a utility that check for setting required field
		By using object for in loop and configuration data later
	* */
	Crud.prototype.checkSettings = function ()
	{
		if(!this.$newModal)
		{
			alert("Missing new dialog modal");
		}
		if(!this.$editModal)
		{
			alert("Missing edit dialog modal");
		}
		if(!this.loadAllUrl)
		{
			alert("Missing Ajax load all URL");
		}
		if(!this.addNewUrl)
		{
			alert("Missing Ajax new URL");
		}
		if(!this.editUrl)
		{
			alert("Missing edit URL");
		}
		if(!this.deleteUrl)
		{
			alert("Missing delete URL");
		}
		if(!this.$btnNew)
		{
			alert("Missing new button");
		}
		if(!this.template)
		{
			alert("Missing template");
		}
		if(!this.$tableBody)
		{
			alert("Missing table body");
		}
	}
	/*Set up all event here
	 * */
	Crud.prototype.showNewForm = function ()
	{
		this.newMode = true;
		this.$newForm.trigger("reset");
		this.$newModal.show();
		$(window).scrollTop(100);
	}
	Crud.prototype.showEditForm = function(json)
	{
		this.newMode = false;
		this.loadJsonValueToForm(this.$editForm,json);
		this.$editModal.show();
		$(window).scrollTop(100);
	};
	Crud.prototype.showDeleteConfirm = function(json)
	{
		var that = this;
		swal({
			  title: 'Are you sure you want to delete this record?',
			  text: "You won't be able to revert this!",
			  type: 'warning',
			  showCancelButton: true,
			  confirmButtonColor: '#3085d6',
			  cancelButtonColor: '#d33',
			  confirmButtonText: 'Yes, delete it!'
			}).then((result) => {
			  if (result.value) {
			    that.ajaxDelete(json);
			  }
			})
	}
	
	Crud.prototype.loadJsonValueToForm = function($formObj, json)
	{
		for(p in json)
		{
			var value = json[p];
			$formObj.find("input[name="+p+"]").val(value);

		}
	}
	Crud.prototype.setUpEventHook = function ()
	{
		var that = this;
		this.$btnNew.on("click",function()
			{
				console.log("New btn click");
				that.showNewForm();
			});
		this.$newModal.find(".btn-close").on("click",function()
				{
					console.log("close btn click");
					that.$newModal.hide();
				});
		this.$newModal.find(".btn-save").on("click",function()
		{
			var form = that.$newForm[0];

		    var formData = new FormData(form);
			that.ajaxAddOrSave(formData);
		});
		
	}
	/*
	 * All Ajax Util
	 * 
	 * */
	Crud.prototype.ajaxLoadAll = function()
	{
		var that = this;
		$.getJSON(that.loadAllUrl,function(data)
				{
					that.renderAll(data);
					that.bindEditAndDeleteEvent();
				});
	}
	Crud.prototype.renderAll = function (allJson)
	{
		for(var i=0,len = allJson.length; i < len; i++)
		{
			var json = allJson[i];
			this.appendNew(json);
		}
	}
	Crud.prototype.appendNew = function (json)
	{
		this.all[json.id] = json;
		
	    this.$tableBody.append(this.template({
	    	obj: json 
	    	})
	    	);
	}
	Crud.prototype.bindEditAndDeleteEvent = function()
	{
		var that = this;
		this.$tableBody.on("click","tr .btn-edit",function(e)
				{
					var id = ($(this).closest("tr").data("id"));
					var json = that.all[id];
					that.showEditForm(json);
					
				});
		this.$tableBody.on("click","tr .btn-delete",function(e)
				{
					var id = ($(this).closest("tr").data("id"));
					console.log("Delete id is ",id);
					var json = that.all[id];
					that.showDeleteConfirm(json);
					
				});
		
	}
	Crud.prototype.ajaxAddOrSave= function (formData)
	{
		console.log("Ajax Add or save");
		var that = this;
		 $.ajax({
		        type: "POST",
		        enctype: 'multipart/form-data',
		        url: that.addNewUrl,
		        data: formData,
		        
		        processData: false, //prevent jQuery from automatically transforming the data into a query string
		        contentType: false,
		        cache: false,
		        timeout: 600000,
		        success: function (data) {

		       
		          that.renderSaveOrUpdate(data);
	          

		        },
		        error: function (e) {

		           
		            console.log("ERROR : ", e);
		          

		        }
		    });	
	}
	Crud.prototype.renderSaveOrUpdate = function (json)
	{
		if(this.newMode)
		{
			this.renderAddNew(json);
		}
		else
		{
			this.renderUpdate(json);
		}
	}
	Crud.prototype.renderAddNew = function (json)
	{
		this.all[json.id] = json;
		var template = this.template;
	    this.$tableBody.append(template({
	    	obj: json 
	    	})
	    	);
	    this.$newModal.hide();
	    this.info('New record successfully added');

	}
	Crud.prototype.info= function(msg)
	{
		 $.notify({
		    	// options
		    	message:  msg
		    },{
		    	// settings
		    	type: 'info'
		    });
	};
	Crud.prototype.renderUpdate = function(json)
	{
		this.all[json.id] = json;
		var template = this.template;
	    var html = template({ 
	    	obj: json 
	    	});
	    this.$tableBody.find("tr[data-id="+json.id+"]").replaceWith(html);
	    this.$editModal.hide();
	    this.info('Record successfully saved');
	}
	Crud.prototype.ajaxDelete = function(json)
	{
		console.log("Ajax Add or save");
		var that = this;
		$.ajax({
			  type: "POST",
			  url: that.deleteUrl+"/"+json.id,
			
			  success: function()
			  {
				  that.renderDelete(json);
			  },
			  
			});
	}
	Crud.prototype.renderDelete = function(json)
	{
		this.$tableBody.find("tr[data-id="+json.id+"]").remove();
		delete this.all[json.id];
		this.info('Record successfully deleted');
	}
	window.Crud = Crud;
}(jQuery));