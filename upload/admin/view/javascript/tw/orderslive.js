
function flashMessage(message){
	let $message = $(message).prependTo('#content');
	setTimeout(function(){
		$message.fadeOut( 1000, function() {
			this.remove();
		});
	},3000)
}
class TwLiveConnectionStatus extends Object{
	constructor(element) {
		super();
		this.$el = $(element);
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
	constructor(element){
		super();
		this.$el = $(element);
		this.sound_dir = 'view/sounds/tw/tworderslive/';
		this.live_is_enabled = true;
		this.options = {
			sound_file : '',
			mute_sound : false,
			continuous_sound: false
		};
		this.sound = '';
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

	saveOptions(options){ // Save options in cookies
		if(!options) options = this.options;
		let expiration_date = new Date();
		expiration_date.setDate(expiration_date.getDate()+30);
		Cookies.set('tw_live_options',JSON.stringify(options),{ expires: expiration_date });
		return this;
	}
	loadOptions(){//Load options from cookies
		if(Cookies.get('tw_live_options')){
			this.options = JSON.parse(Cookies.get('tw_live_options'));
		}
		return this;
	}

	parseSettings(){
		this.options.mute_sound = this.$el.find('#tw-mute-sound').prop('checked');
		this.options.continuous_sound = this.$el.find('#tw-continuous-sound').prop('checked');
		this.options.sound_file = this.$el.find('#tw-sound-select').val();
		if(this.sound){
			this.sound.pause();
		}
		this.sound = new Audio(this.sound_dir+this.options.sound_file);
		if (this.options.continuous_sound) this.sound.loop = true;
		return this;
	}

	optionsToUi(){
		this.$el.find('#tw-mute-sound').prop('checked',this.options.mute_sound);
		this.$el.find('#tw-continuous-sound').prop('checked',this.options.continuous_sound);
		this.$el.find('#tw-sound-select option[value="'+this.options.sound_file+'"]').prop('selected',true);
		return this;
	}
}
var settings = new TwLiveSettings('#settings');

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
			url: 'index.php?route=customer/customer/addhistory',
			type: 'post',
			dataType: 'json',
			data: {
				'comment' : encodeURIComponent(comment.val()),
				'token' : token,
				'customer_id' : customer_id
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
	var evtobj = window.event? event : e;
	if (evtobj.keyCode == 90 && evtobj.ctrlKey){
		if(order_data_undo_array.length){
			let $order_tab = order_data_undo_array.pop();
			$order_tab.removeClass('hidden');
		}
	}
}
function refreshOrder(order_id) {
	$.ajax({
		url: 'index.php?route=sale/tw_live/refresh&token=' + token,
		method: "GET",
		data: {
			"order_id": order_id
		},
		success: function (r) {
			$("#order-" + order_id).replaceWith(r.order);
			$("#order-" + order_id).addClass("active");
			$("#order-tab-" + order_id).replaceWith(r.tab);
			$("#order-tab-" + order_id).attr("class", "active");
		},
		complete : updateElapsed
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

function updateOrderList(orders) {
	for (let order of orders) {
		if ($('#order-tab-' + order.order_id).length) {
			// If we are here, it means we already have the order in our list 
			// we just need to update it's info. Might add some sort of animation here
			$('#order-tab-' + order.order_id).replaceWith(order.order_tab);
			$('#order-' + order.order_id).replaceWith(order.order_data);
		} else { // we have a new order. Play sound and mark it as new
			$('#order-details').append(order.order_data);
			$('#order-tabs').prepend(order.order_tab);
			settings.playNotification();
			updateElapsed();
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



var tw_main_loop = setInterval(checkForNewOrders, 5000);

//Events and function
$(document).ready(function(){
	settings.loadOptions().saveOptions().optionsToUi().parseSettings();
})

$('#tw-toggle-live').click(function(){
	settings.toggleLive();
	if(settings.live_is_enabled) $(this).removeClass('disabled');
	else $(this).addClass('disabled');
})

$('#settings').change(function(e){
	settings.parseSettings().saveOptions();
})

$('#sound-preview').click(function(e){
	e.preventDefault();
	settings.playNotification(true);
})

$('#sound-stop').click(function(e){
	e.preventDefault();
	settings.stopNotification();
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
	let order_tab = $("#order-tab-"+order_id).addClass('hidden');
	// Show the first available order since the currently selected one should be hidden
	$('#order-tabs a:first').tab('show')
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