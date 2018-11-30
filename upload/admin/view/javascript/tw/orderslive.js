
function flashMessage(message){
	let $message = $(message).prependTo('#content');
	setTimeout(function(){
		$message.fadeOut( 1000, function() {
			this.remove();
		});
	},3000)
}
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
		this.$el.attr('class',"label "+ServerStatuses.style[status]);
	}
}
var connection_status = new TwLiveConnectionStatus('#server-status');

class TwLiveSettings extends Object{

	constructor(selector){
		super();
		this.$el = $(selector);
		this.sound_dir = 'view/sounds/tw/tworderslive/';
		this.live_is_enabled = true;
		this.options = {
			sound_file : '',
			mute_sound : false,
			continuous_sound: false,
			sort_key : 'order-group',
			filter_key : '' 
		};
		this.sound = '';

		this.load().update().synchronizeUI().save();

		this.$el.change(function(e){
			settings.parseUI().update().save();
		})
	}
	
	_getInputValue(option){
		//get All inputs assiciated with this model
		let $inputs = this.$el.find(`[v-model="${option}"]`);
		let ret_value = null;
		$inputs.each(function(index,element){
			let type = element.nodeName;
			switch(type){
				case "SELECT":
					ret_value = element.selectedOptions.length ?	element.selectedOptions.length > 1 
						? Array.from(element.selectedOptions).map(x => x.value)
					: element.selectedOptions[0].value
					: null; //Wow i'm so clever...
					break;
				case "INPUT":
					type = element.type;
				case "checkbox":
					ret_value = element.checked;
					break;
				case "radio" :
					// Only set value if radio is checked. 
					// Else keep it's previous value (which should be null if never checked)
					ret_value = element.checked ? element.value : ret_value;
					break;
				default: 
					ret_value = element.value;
					break;
			}
		})
		return ret_value;
	}
	_setInputValue(option, value){
		let $inputs = this.$el.find(`[v-model="${option}"]`);
		$inputs.each(function(index,element){
			let type = element.nodeName;
			switch(type){
				case "SELECT":
					for(option of element.options){
						option.selected = (option.value == value) || value.includes(option.value);
					}
					break;
				case "INPUT":
					type = element.type;
				case "checkbox":
					element.checked = value;
					break;
				case "radio" :
					element.checked = element.value == value;
					break;
				default: 
					element.innerHTML = value;
					break;
			}
		})
	}

	// Set the options bases on what's selected on the UI
	parseUI(){
		for(let option in this.options){
			this.options[option] = this._getInputValue(option);
		}

		return this;
	}
	
	playNotification(force){
		if(!this.options.mute_sound || force === true) this.sound.play();
		return this;
	}

	stopNotification(){
		if(this.sound) this.sound.pause();
	}

	toggleLive(){
		this.live_is_enabled = !this.live_is_enabled;
		connection_status.setStatus(ServerStatuses.STOPPED);
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
			this.options = JSON.parse(Cookies.get('tw_live_options'));
		}
		return this;
	}

	update(){
		if(this.sound){
			this.sound.pause();
		}
		this.sound = new Audio(this.sound_dir+this.options.sound_file);
		this.sound.loop = this.options.continuous_sound;
		return this;
	}

	synchronizeUI(){
		for(let option in this.options){
			this._setInputValue(option,this.options[option]);
		}

		return this;
	}
}
var settings = new TwLiveSettings('#tw-settings');

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


var sortOrders = function(key){
	// sortOrders.previousKey = sortOrders.previousKey || '';
	sortOrders.descending = sortOrders.previousKey === key 
		? !sortOrders.descending
		: true;
	sortOrders.previousKey = key;
	order_tabs.sort( (itemA, itemB) => {
		let one = $(itemA.getElement()).data(key);
		let another = $(itemB.getElement()).data(key);
		return one - another;
	  },{descending: sortOrders.descending});
}

function filterOrders(key){
	let statuses = {
	  'pending' : 1,
	  'complete': 2,
	  'misc'    : 3
	}
	  order_tabs.filter(function(item){
	  $item = $(item.getElement());
		  return !$item.data('removed') && ( key ? $item.data('order-group') == statuses[key] : true );
	  })
  }

function undo(e) {
	var evtobj = window.event? event : e;
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
	$.ajax({
		url: 'index.php?route=user/api/addip',
		type: 'post',
		data: {
			'token' : token,
			'ip' : api_ip,
			'api_id' : api_id
		},
		dataType: 'json',
		beforeSend: function () {
			$('#button-ip-add').button('loading');
		},
		complete: function () {
			$('#button-ip-add').button('reset');
		},
		success: function (json) {
			$('.alert').remove();

			if (json['error']) {
				flashMessage('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> ' + json['error'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');
			}

			if (json['success']) {
				flashMessage('<div class="alert alert-success"><i class="fa fa-check-circle"></i> ' + json['success'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
		}
	});
}
// Login to the API

//Automatic API
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
				window.location.reload;
					// $('#content > .container-fluid').prepend('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> ' + json['error']['ip'] + ' <button type="button" id="button-ip-add" data-loading-text="<?php echo $text_loading; ?>" class="btn btn-danger btn-xs pull-right"><i class="fa fa-plus"></i> <?php echo $button_ip_add; ?></button></div>');
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
	order_tabs.add($(order.order_tab).addClass("new").get(0),{index: 0});
	$('#order-details').append(order.order_data);
	document.dispatchEvent(new CustomEvent('tw.order.added',{detail: order}));
}

// Update an already existing order with the data from the response
var updateOrder = function(order){
	//First chack if we actually have the order
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
	document.dispatchEvent(new CustomEvent('tw.order.changed',{detail: order}));
}

var hideOrder = function(order_id){
	//Hide the tab
	let $el = $('#order-tab-' + order_id);
	$el.data('removed',true);
	order_tabs.hide($el[0]);
	//Also hide the info
}

$(document).on('tw.order.changed',function(e){
	sortOrders();
	filterOrders();
	console.log("order updated",e.detail);
	order_tabs.refreshSortData();
})
$(document).on('tw.order.added',function(e){
	sortOrders();
	filterOrders();
	settings.playNotification();
	updateElapsed();
})


function updateOrderList(orders) {
	for (let order of orders) {
		if ($('#order-tab-' + order.order_id).length) {
			updateOrder(order,false);
		} else { // we have a new order. Play sound and mark it as new
			addNewOrder(order);
		}
	}
}
function getOrdersByTimestamp() {
	return $.ajax({
		url: 'index.php?route=sale/tw_live/checkTimestamp',
		method: 'GET',
		data: {
			'token': token,
			'timestamp': tw_live_timestamp
		}
	})
}
function getOrdersById() {
	return $.ajax({
		url: 'index.php?route=sale/tw_live/check',
		method: 'GET',
		data: {
			'token': token,
			'last_order_id': last_order_id
		}
	})
}

//Main script - Check for new orders ever 5 seconds
function checkForNewOrders(){
	getOrdersByTimestamp().then(
		function(r){
			updateOrderList(r.orders);
			if(r.new_timestamp > tw_live_timestamp) tw_live_timestamp = r.new_timestamp;
			if (connection_status != ServerStatuses.OK) {
				connection_status.setStatus(ServerStatuses.OK);
			} 
		},
		function(){					
			$('#tw-response-time').html("No response")
			connection_status.setStatus(ServerStatuses.ERROR);
		}
	)
}
checkForNewOrders();
var tw_main_loop = setInterval(function(){ if(settings.live_is_enabled) checkForNewOrders() }, 5000);

//Events and function

$('#tw-toggle-live').click(function(){
	settings.toggleLive();
	if(settings.live_is_enabled) $(this).removeClass('disabled');
	else $(this).addClass('disabled');
})


$('#sound-preview').click(function(e){
	e.preventDefault();
	settings.playNotification(true);
})

$('#sound-stop').click(function(e){
	e.preventDefault();
	settings.stopNotification();
})

$('[name="order_filter"]').change(function(e){
	filterOrders(e.target.value);
})

$('[name="order_sort"]').on('input change' ,function(e){
	sortOrders(e.target.value);
})

$(document).on('click', '.new',function(){
	$(this).removeClass('new');
	settings.sound.pause();
})

$(document).on('click', '.refresh-order', function (e) {
	let order_id = $(this).data('order-id');
	refreshOrder(order_id);
});
$(document).on('click', 'a[href="#"]', function (e) {
	e.preventDefault();
})
$(document).on('click','#button-ip-add',  addIpToApi);
document.onkeydown = undo;

$(document).on('click', '.remove-order', function (e) {
	let order_id = $(this).data('order-id');
	hideOrder(order_id);
	// Show the first available visible order since the currently selected one should be hidden
	$('.order-tab').not('.hidden')[0]
	if($('.order-tab').not('.hidden')[0]) $($('.order-tab').not('.hidden')[0]).find('a').tab('show');
	else $('.tab-pane.active').removeClass('active');//Hide the last remaining order
	order_data_undo_array.push($("#order-tab-"+order_id));
});

$('.history').delegate('.pagination a', 'click', function (e) {
	e.preventDefault();
	$(this).closest('.history').load(this.href);
});

$('#content').off('click', '.customer-history-add').on('click', '.customer-history-add', addCustomerHistory);
$('#content').off('click', '.order-history-add').on('click', '.order-history-add', addOrderHistory);
updateElapsed();
setInterval(updateElapsed, 60000);