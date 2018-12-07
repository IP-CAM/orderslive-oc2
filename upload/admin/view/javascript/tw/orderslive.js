
function flashMessage(message){
	let $message = $(message).prependTo('#content');
	setTimeout(function(){
		$message.fadeOut( 1000, function() {
			this.remove();
		});
	},3000)
}

const _debounce = (a,b=250,c)=>(...d)=>clearTimeout(c,c=setTimeout(a,b,...d))

class TwLiveConnectionStatus extends Object{
	constructor(selector) {
		super();
		this.$el = $(selector);
		this.status_id = ServerStatuses.UNKNOWN;
	}

	valueOf(){
		return this.status_id;
	}
	setStatus(status){
		this.status_id = status;
		this.$el.html(ServerStatuses.title[status]);
		this.$el.attr('class',"label " + ServerStatuses.style[status]);
	}
}
class TwLiveSettings extends Object{

	constructor(selector){
		super();
		this.$el = $(selector);
		this.container = this.$el[0];
		this.sound_dir = 'view/sounds/tw/tworderslive/';
		this.live_is_enabled = true;
		this.options = {
			sound_file : '',
			mute_sound : false,
			continuous_sound: false,
			sort_key : 'arrived',
			sort_direction : 'descending',
			filter_key : '',
			always_show_new: true,
			new_always_on_top: true
		};
		this.sound = '';

		let self = this;

		this.$el.change(function(){
			self.parseUI().save();
		})
		return this;
	}

	// Set the options bases on what's selected on the UI
	parseUI(){
		for(let option in this.options){
			try{
				this.options[option] = this._getInputValue(option);
			} catch(error){
				//console.log(error);
			}
		}

		return this;
	}
	
	synchronizeUI(){
		for(let option in this.options){
			try{
				this._setInputValue(option,this.options[option]);
				//hack
				if($(`[value="${this.options[option]}"]`).parent('.btn').length){
					$(`[value="${this.options[option]}"]`).parent('.btn').addClass('active');
				}
			} catch(error){
				console.log(error);
			}
		}
		//hack
		this.$el.find('input').not(':checked').parent().removeClass('active')
		return this;
	}
 
	// Save options in cookies
	save(options){
		if(!options) options = this.options;
		let expiration_date = new Date();
		expiration_date.setDate(expiration_date.getDate() + 30);
		Cookies.set('tw_live_options',JSON.stringify(options),{ expires: expiration_date });
		return this;
	}

	load(){//Load options from cookies
		if(Cookies.get('tw_live_options')){
			let cookie = JSON.parse(Cookies.get('tw_live_options'));
			for(let option in this.options){
				if(cookie.hasOwnProperty(option)) this.options[option] = cookie[option];
			}
		}
		return this;
	}
		
	//get All inputs associated with this model
	_getInputValue(option, default_value = null){
		let type = this._getOptionType(option);
		switch(type){
			case "SELECT":
				let options = this.container.querySelectorAll(`[v-model="${option}"] > option:checked`);
				return options.length ?	options.length > 1 
					? Array.from(options).map(x => x.value)
					: options[0].value
				: null; //Wow i'm so clever...
			case "checkbox":
				let element = document.querySelector(`[v-model="${option}"]`);
				return element.checked;
			case "radio" :
				let radio = this.container.querySelector(`[v-model="${option}"]:checked`);
				return radio ? radio.value : default_value;
			default: 
				return element.value;
		}
	}

	_setInputValue(option, value){
		let type = this._getOptionType(option);
		let inputs;
		switch(type){
			case "SELECT":
				inputs = this.container.querySelectorAll(`[v-model="${option}"] > option`);
				for(let option of inputs) 
					option.selected = (option.value == value) || value.includes(option.value);
				break;
			case "checkbox":
				inputs = this.container.querySelectorAll(`[v-model="${option}"]`);
				for(let checkbox of inputs) 
					checkbox.checked = value;
				break;
			case "radio" :
				inputs = this.container.querySelectorAll(`[v-model="${option}"]`);
				for(let radio of inputs)
					radio.checked = (radio.value == value);
				break;
			default:
				inputs = this.container.querySelectorAll(`[v-model="${option}"]`)
				for(let element of inputs) 
					element.innerHTML = value;
				break;
		}
	}

	_getOptionType(option){
		let $inputs = this.$el.find(`[v-model="${option}"]`);
		if(!$inputs.length) throw `No input found associated with option '${option}'`;
		let element = $inputs[0];
		switch(element.nodeName){
			case "INPUT":
				return element.type;
			default: return element.nodeName;
		}
	}

}

class TwLive {
	constructor(settings,connection_status) {
		this.settings = settings;
		this.connection_status = connection_status;
		this.orders = order_tabs;
		let self = this;

		WatchJS.watch(this.settings.options,_debounce(() => {
			self.settings.save().synchronizeUI();
		}),25)

		WatchJS.watch(this.settings.options, 'sound_file', function () {
			let settings = self.settings;
			if (settings.sound) {
				settings.sound.pause();
			}
			settings.sound = new Audio(settings.sound_dir + settings.options.sound_file);
			settings.sound.loop = settings.options.continuous_sound;
		})

		WatchJS.watch(this.settings.options, 
			['sort_key', 'filter_key', 'sort_direction','always_show_new','new_always_on_top'], 
		_debounce(() => {
			this.filterOrders();
			this.sortOrders();
		}),50)

		// If the always_show_new option is true, show all new orders that were filtered
		this.orders.on('filter',(unused,hidden) => {
			if(this.settings.options.always_show_new)
				hidden.forEach((x) => {if($(x.getElement()).hasClass('new')) this.orders.show(x) })
		})
		// If new_always_on_top is true, put all new orders on the top of the list
		this.orders.on('sort',(newOrder) => {
			if(this.settings.options.new_always_on_top)
				newOrder.forEach((x) => { if($(x.getElement()).hasClass('new')) this.orders.move(x,0)})
		})
		this.settings.load();
	}
	
	playNotification(force) {
		if (!this.settings.options.mute_sound || force === true)
			this.settings.sound.play();
	}

	stopNotification(){
		if (this.settings.sound)
			this.settings.sound.pause();
	}

	toggleLive(){
		this.settings.live_is_enabled = !this.settings.live_is_enabled;
		this.connection_status.setStatus(ServerStatuses.STOPPED);
	}

	sortOrders(key, descending) {
		let settings = this.settings;
		if (!key)
			key = settings.options.sort_key;
		if (descending == null)
			descending = (settings.options.sort_direction == 'descending');
		this.orders.sort((itemA, itemB) => {
			let one = $(itemA.getElement()).data(key);
			let another = $(itemB.getElement()).data(key);
			return one - another;
		}, { descending: descending });
	}

	filterOrders(key) {
		if (!key)
			key = this.settings.options.filter_key;
		let statuses = {
			'pending': 1,
			'complete': 3,
			'misc': 2
		};
		this.orders.filter(function (item) {
			let $item = $(item.getElement());
			return !$item.data('removed') && (key ? $item.data('order-group') == statuses[key] : true);
		});
	}
}

var order_tabs = new Muuri('#order-tabs',{
	items : '.order-tab',
	itemHiddenClass : 'hidden'
})

var app = new TwLive(
	new TwLiveSettings('#tw-settings'),
	new TwLiveConnectionStatus('#server-status')
)

var addOrderHistory = function (e) {
	let btn = this;
	let order_id = $(this).data('id');
	let store_id = $(this).data('store-id');
	let form = $("#history-" + order_id + "-form");
	$.ajax({
		url: catalog + 'index.php?route=api/order/history&token=' + api_token + '&store_id=' + store_id + '&order_id=' + order_id,
		type: 'post',
		dataType: 'json',
		data: 'order_status_id=' + encodeURIComponent(form.find('select[name=\'order_status_id\']').val()) + '&notify=' + (form.find('input[name=\'notify\']').prop('checked') ? 1 : 0) + '&override=' + (form.find('input[name=\'override\']').prop('checked') ? 1 : 0) + '&append=' +
		(form.find('input[name=\'append\']').prop('checked') ? 1 : 0) + '&comment=' + encodeURIComponent(form.find('textarea[name=\'comment\']').val()),
		beforeSend: function () {
			$(btn).button('loading');
		},
		complete: function () {
			$(btn).button('reset');
			refreshOrder(order_id);
		},
		success: function (json) {
			$('.alert').remove();

			if (json['error']) {
				flashMessage('<div class="alert alert-danger alert-flash"><i class="fa fa-exclamation-circle"></i> ' + json['error'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');
			}

			if (json['success']) {
				flashMessage('<div class="alert alert-success alert-flash"><i class="fa fa-check-circle"></i> ' + json['success'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');
			}
		}
	});
}
var addCustomerHistory = function (e) {
	let btn = this;
	let customer_id = $(this).data('id');
	let comment = $(btn).parent('.panel-body').find('[name="comment"]');
	if (comment.val() != '') {
		$.ajax({
			url: 'index.php?route=customer/customer/addhistory&token=' + token +'&customer_id='+customer_id,
			type: 'post',
			dataType: 'json',
			data: {
				'comment' : encodeURIComponent(comment.val())
			},
			beforeSend: function () {
				$(btn).button('loading');
			},
			complete: function () {
				$(btn).button('reset');
			},
			success: function (json) {
				$('.alert').remove();

				if (json['error']) {
					flashMessage('<div class="alert alert-danger alert-flash"><i class="fa fa-exclamation-circle"></i> ' + json['error'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div></div>');
				}

				if (json['success']) {
					flashMessage('<div class="alert alert-success alert-flash"><i class="fa fa-check-circle"></i> ' + json['success'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div></div>');

					$('.history-' + customer_id).load('index.php?route=customer/customer/history&token=' + token + '&customer_id=' + customer_id);

					comment.val('');
				}
			}
		});
	}
}

// Updates the text that says how long ago the order was created/updated
function updateElapsed() {
	$('.time-elapsed').each(function () {
		let time = $(this).data('time');
		$(this).html(moment(time).fromNow());
	})
}

function undo(e) {
	let evtobj = window.event? event : e;
	if (evtobj.keyCode == 90 && evtobj.ctrlKey){
		if(order_data_undo_array.length){
			let $order_tab = order_data_undo_array.pop();
			$order_tab.data('removed',false);
			order_tabs.show($order_tab[0]);
		}
	}
}

function refreshOrder(order_id) {
	$.ajax({
		url: 'index.php?route=sale/tw_live/refresh',
		method: "GET",
		data: {
			"token" : token,
			"order_id": order_id
		},
		success: function (r) {
			updateOrder(r);
		}
	})

}

var addIpToApi = function () {
	return $.ajax({
		url: `index.php?route=user/api/addip&api_id=${api_id}&token=${token}`,
		type: 'post',
		data: {
			'ip' : api_ip
		},
		dataType: 'json',
		success: function (json) {
			$('.alert').remove();

			if (json['error']) {
				flashMessage('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> ' + json['error'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');
			}

			if (json['success']) {
				window.location.reload();
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
		}
	})
}

//Automatic login to API
$.ajax({
	url: catalog + 'index.php?route=api/login',
	type: 'post',
	dataType: 'json',
	data: {
		'key' :api_key
	},
	crossDomain: true,
	success: function (json) {
		$('.alert').remove();
		if (json['error']) {
			if (json['error']['key']) {
				flashMessage('<div class="alert alert-danger alert-flash"><i class="fa fa-exclamation-circle"></i> ' + json['error']['key'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');
			}

			if (json['error']['ip']) {
				addIpToApi();
			}
		}

		if (json['token']) {
			api_token = json['token'];
		}
	},
	error: function (xhr, ajaxOptions, thrownError) {
		alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
	}
});

// Take a new order object returned from the server and marks it as 'new'
// adds it to the list and plays notification sound
var addNewOrder = function(order){
	// If this is actually a new order (based on our timestamp) and we are not just loading more orders
	if($(order.order_tab).data('timestamp') >= tw_live_timestamp) {
		order_tabs.add($(order.order_tab).addClass('new').get(0),{index: 0});
		document.dispatchEvent(new CustomEvent('tw.orders.new',{detail: order}));
	} else {
		order_tabs.add($(order.order_tab).get(0));
	}
	$('#order-details').append(order.order_data);
	document.dispatchEvent(new CustomEvent('tw.orders.modified',{detail: order}));
}

// Update an already existing order with the data from the response
var updateOrder = function(order){
	//First check if we actually have the order
	//Then update only if the order has changed. We do this to avoid updating an up-to-date order
	//which solves so many issues with muuri and updating the DOM and other stuff...
	let $old_tab = $("#order-tab-"+order.order_id);
	if(!$old_tab.length || ! (order.timestamp > $old_tab.data('timestamp')) ) return;
	//We just replace the order data part
	$('#order-' + order.order_id).html(order.order_data);
	
	//but this doesn't work very well with replacing elements
	let $new_tab = $(order.order_tab);
	// update the data attributes that need to change
	// TODO: Might need to change this to use $.attr() instead
	$old_tab.data('timestamp',$new_tab.data('timestamp'));
	$old_tab.data('order-group',$new_tab.data('order-group'));
	$old_tab.data('status-id',$new_tab.data('status-id'));
	
	$old_tab.html($new_tab.html());
	document.dispatchEvent(new CustomEvent('tw.orders.modified',{detail: order}));
}

var hideOrder = function(order_id){
	//Hide the tab
	let $el = $('#order-tab-' + order_id);
	$el.data('removed',true);
	order_tabs.hide($el[0]);
	//Also hide the info
}

document.addEventListener('tw.orders.modified',_debounce(() => {
	app.sortOrders();
	app.filterOrders();
	//app.orders.refreshSortData();
	updateElapsed();
},100))

document.addEventListener('tw.orders.new',_debounce(() => {
	app.playNotification();
},100));

function updateOrderList(orders) {
	for (let order of orders) {
		if ($('#order-tab-' + order.order_id).length) {
			updateOrder(order,false);
		} else { // we have a new order. Play sound and mark it as new
			addNewOrder(order);
		}
	}
}

var getMoreOrders = function(){
	return $.ajax({
		url: 'index.php?route=sale/tw_live/more',
		method: 'GET',
		data: {
			'token': token,
			'page': tw_order_page
		}
	})
}

function getOrdersByTimestamp() {
	return $.ajax({
		url: 'index.php?route=sale/tw_live/check',
		method: 'GET',
		data: {
			'token': token,
			'timestamp': tw_live_timestamp
		}
	})
}

//Main script - Check for new orders ever 5 seconds
function checkForNewOrders(){
	getOrdersByTimestamp().then(
		function(r){
			updateOrderList(r.orders);
			if(r.new_timestamp > tw_live_timestamp) tw_live_timestamp = r.new_timestamp;
			if (app.connection_status != ServerStatuses.OK) {
				app.connection_status.setStatus(ServerStatuses.OK);
			} 
		},
		function(){					
			app.connection_status.setStatus(ServerStatuses.ERROR);
		}
	)
}
checkForNewOrders();
var tw_main_loop = setInterval(function(){ if(app.settings.live_is_enabled) checkForNewOrders() }, 5000);

//Events and function

$('#tw-toggle-live').click(function(){
	app.toggleLive();
	if(app.settings.live_is_enabled) $(this).removeClass('disabled');
	else $(this).addClass('disabled');
})

$('#sound-preview').click(function(e){
	app.playNotification(true);
})

$('#sound-stop').click( app.stopNotification())

$(document).on('click', '.new',function(){
	$(this).removeClass('new');
	app.stopNotification();
})

$(document).on('click', '.refresh-order', function (e) {
	let order_id = $(this).data('order-id');
	refreshOrder(order_id);
})

$(document).on('click', 'a[href="#"]', function (e) {
	e.preventDefault();
})
$(document).on('click','#button-ip-add',  addIpToApi);

document.onkeydown = undo;

$(document).on('click', '.remove-order', function (e) {
	let order_id = $(this).data('order-id');
	hideOrder(order_id);
	// Show the first available visible order since the currently selected one should be hidden
	let visible_orders = order_tabs.getItems().filter(x => x.isVisible());
	if(visible_orders.length) $(visible_orders[0].getElement()).find('a').tab('show');
	else $('.tab-pane.active').removeClass('active');//Hide the last remaining order
	order_data_undo_array.push($("#order-tab-"+order_id));
})

$('#tw-reset-filters').click(() => {
		app.settings.options.sort_key = 'arrived';
		app.settings.options.sort_direction = 'descending';
		app.settings.options.filter_key = '';
		app.settings.options.always_show_new = true;
		app.settings.options.new_always_on_top = true;
})

$('.history').delegate('.pagination a', 'click', function (e) {
	e.preventDefault();
	$(this).closest('.history').load(this.href);
})

$('#tw-load-more').click(function(e){
	getMoreOrders().success(function(r){
		updateOrderList(r.orders);
		if(r.page == 0) $(e.target).parent().remove();
		else tw_order_page = r.page;
	})
})

$('#content').off('click', '.customer-history-add').on('click', '.customer-history-add', addCustomerHistory);

$('#content').off('click', '.order-history-add').on('click', '.order-history-add', addOrderHistory);

updateElapsed();

setInterval(updateElapsed, 60000);