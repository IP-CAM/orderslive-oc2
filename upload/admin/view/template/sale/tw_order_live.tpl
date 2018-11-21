<?= $header ?>
	<?= $column_left ?>
		<div id="content">
			<nav class="navbar navbar-default">
				<div class="container-fluid">
					<div class="navbar-header">
						<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#tw-orders-live-nav" aria-expanded="false">
						<span class="sr-only">Toggle navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						</button>
						<div class="navbar-brand">
							<span id="tw-toggle-live"></span>LIVE! <span id="tw-live-version"> <?= "v".TW_ORDERS_LIVE_VERSION ?></span>|
							<span id="server-info"><?= $text_connection ?> <span id="server-status" class="label label-default"><?= $status_unknown ?></span> </span>
							<small id="tw-response-time" data-toggle="tooltip" title="<?= $text_average_response_time?>"></small>
						</div>
					</div>
					<div class="collapse navbar-collapse" id="tw-orders-live-nav">
						<ul class="nav navbar-nav navbar-right" id="settings">
							<li>
								<form class="form-inline">
									<div class="checkbox">
										<label data-toggle="tooltip" title="<?= $text_continuous_info ?>"><input id="tw-continuous-sound" type="checkbox"> <?= $text_continuous ?></label>
									</div>
									<div class="checkbox">
										<label data-toggle="tooltip" title="<?= $text_mute_info ?>"><input id="tw-mute-sound" type="checkbox"> <?= $text_mute ?></label>
									</div>
									<div class="form-group input-group input-group-sm">
										<select class="form-control" id="tw-sound-select" data-toggle="tooltip" title="<?= $text_sound_info ?>">
											<?php foreach ($sound_files as $sound_file) {
												echo '<option value="'.$sound_file['file'].'">' . $sound_file['name'].'</option>';
											} ?>
										</select>
										<span class="input-group-btn">
									        <button class="btn btn-default" id="sound-stop" data-toggle="tooltip" type="button"><i class="fa fa-pause fa-lg"></i></button>
										</span>
										<span class="input-group-btn">
									        <button class="btn btn-default" id="sound-preview" data-toggle="tooltip" title="<?= $text_play_sound ?>" type="button"><i class="fa fa-play fa-lg"></i></button>
										</span>
									</div>
								</form>
							</li>
						</ul>
					</div>
				</div>
				<div class="container-fluid">
					<div class="row">
						<div class="col-sm-12">
							<div class="btn-group" id="">
								<button type="button" data-filter="all" class="btn btn-default">All</button>
								<button type="button" data-filter="1" class="btn btn-default">Green</button>
								<button type="button" data-filter="2" class="btn btn-default">Orange</button>
								<button type="button" data-filter="3" class="btn btn-default">Grey</button>
							</div>
						</div>
					</div>
				</div>
			</nav>

			<div class="container-fluid">
				<div class="row">
					<div class="col-sm-3 col-md-2">
						<ul id="order-links" class="nav nav-pills nav-stacked" role="tablist">
							<hr />
							<?php
								foreach($order_tabs as $tab) echo $tab;
							?>
						</ul>
					</div>
					<div class="col-sm-9 col-md-10">
						<div id="order-details" class="tab-content">
							<?php
								foreach($order_details as $details) echo $details;
							?>
						</div>
					</div>
				</div>
			</div>
		</div>
<script src="view/javascript/tw/moment-with-locales.min.js" type="text/javascript"></script>
<script src="view/javascript/tw/js.cookie.min.js" type="text/javascript"></script>

<script>
	function flashMessage(message){
		let $message = $(message).prependTo('#content');
		setTimeout(function(){
			$message.fadeOut( 1000, function() {
				this.remove();
			});
		},3000)
	}

	//Server Status
	const ServerStatuses = Object.freeze({
	    UNKNOWN : 0,
		OK      : 1,
		ERROR   : 2,
		STOPPED : 3,
        title : {
            0 : '<?= $status_unknown ?>',
	        1 : '<?= $status_ok ?>',
	        2 : '<?= $status_error ?>',
	        3 : '<?= $status_stopped ?>'
	    },
		style :{
            0 : "label-default",
            1 : "label-success",
            2 : "label-danger",
			3 : "label-warning"
		}
	});

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
	
    moment.locale("<?= $locale ?>");

	var token = '<?= $token ?>';
	var last_order_id = window.last_order_id ? window.last_order_id : 0;
	var tw_live_timestamp = window.tw_live_timestamp ? window.tw_live_timestamp : 0;
    var ip_token = '';


	var addOrderHistory = function (e) {
		let btn = this;
		let order_id = $(this).data('id');
		let store_id = $(this).data('store-id');
		let form = $("#history-" + order_id + "-form");
		$.ajax({
			url: '<?php echo $catalog; ?>index.php?route=api/order/history&token=' + api_token + '&store_id=' + store_id + '&order_id=' + order_id,
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
				url: 'index.php?route=customer/customer/addhistory&token=<?php echo $token; ?>&customer_id=' + customer_id,
				type: 'post',
				dataType: 'json',
				data: 'comment=' + encodeURIComponent(comment.val()),
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

						$('.history-' + customer_id).load('index.php?route=customer/customer/history&token=<?php echo $token; ?>&customer_id=' + customer_id);

						comment.val('');
					}
				}
			});
		}
	}
	function updateElapsed() {
		$('.time-elapsed').each(function () {
			let time = $(this).data('time');
			$(this).html(moment(time).fromNow());
		})
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
			url: 'index.php?route=user/api/addip&token=<?php echo $token; ?>&api_id=<?php echo $api_id; ?>',
			type: 'post',
			data: 'ip=<?php echo $api_ip; ?>',
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

	$(document).on('click','#button-ip-add',  addIpToApi);
	//Automatic API
	$.ajax({
		url: '<?php echo $catalog; ?>index.php?route=api/login',
		type: 'post',
		dataType: 'json',
		data: 'key=<?php echo $api_key; ?>',
		crossDomain: true,
		success: function (json) {
			$('.alert').remove();
			if (json['error']) {
				if (json['error']['key']) {
					flashMessage('<div class="alert alert-danger alert-flash"><i class="fa fa-exclamation-circle"></i> ' + json['error']['key'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');
				}

				if (json['error']['ip']) {
					addIpToApi();
					//	$('#content > .container-fluid').prepend('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> ' + json['error']['ip'] + ' <button type="button" id="button-ip-add" data-loading-text="<?php echo $text_loading; ?>" class="btn btn-danger btn-xs pull-right"><i class="fa fa-plus"></i> <?php echo $button_ip_add; ?></button></div>');
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


	$(document).on('click', 'a[href="#"]', function (e) {
		e.preventDefault();
	})

	function updateOrderList(orders) {
		for (let order of orders) {
			if ($('#order-tab-' + order.order_id).length) {
				// If we are here, it means we already have the order in our list 
				// we just need to update it's info. Might add some sort of animation here
				$('#order-tab-' + order.order_id).replaceWith(order.order_tab);
				$('#order-' + order.order_id).replaceWith(order.order_data);
			} else { // we have a new order. Play sound and mark it as new
				$('#order-details').append(order.order_data);
				$('#order-links').prepend(order.order_tab);
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
	getOrdersByTimestamp()
		.then(function(r){
			updateOrderList(r.orders);
			if(r.new_timestamp > tw_live_timestamp) tw_live_timestamp = r.new_timestamp;
			if (connection_status != ServerStatuses.OK) {
				connection_status.setStatus(ServerStatuses.OK);
			} 
		},
		function(){					
			$('#tw-response-time').html("No response")
			connection_status.setStatus(ServerStatuses.ERROR);
	})

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

	$(document).on('click', '.refresh-order', function (e) {
		let order_id = $(this).data('order-id');
		refreshOrder(order_id);
	});

    var order_data_undo_array = new Array();

    function undo(e) {
        var evtobj = window.event? event : e;
        if (evtobj.keyCode == 90 && evtobj.ctrlKey){
            if(order_data_undo_array.length){
                let $order_tab = order_data_undo_array.pop();
				$order_tab.removeClass('hidden');
                
            }
        }
    }
    document.onkeydown = undo;

    $(document).on('click', '.remove-order', function (e) {
        let order_id = $(this).data('order-id');
		let order_tab = $("#order-tab-"+order_id).addClass('hidden');
		// Show the first available order since the currently selected one should be hidden
		$('#order-links a:first').tab('show')
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
</script>
<style>
	.new {
		background: #b9fdb9;
	}
	#tw-toggle-live{
		width: 15px;
		height: 15px;
		border: 1px solid red;
		border-radius: 100%;
		animation: 2s live infinite;
		margin-right: 5px;
		display: inline-block;
		cursor: pointer;
	}
	#tw-toggle-live.disabled{
		animation:none;
		border-color: grey;
	}

	@keyframes live {
		0% {
			background : red;
			box-shadow: 0 0 4px 0px red;
		}
		25% {
			background: white;
			box-shadow: 0 0 0px 0px red;
		}
		100% {
			background: red;
			box-shadow: 0 0 4px 0px red;
		}
	}

	#tw-response-time{
		opacity: .8;
		font-weight: bold;
		font-size: 75%;
	}

	.alert.alert-flash {
		position: fixed;
		top: 3%;
		z-index: 1000;
		left: 5%;
		right: 5%;
	}
	span#tw-live-version {
		display: inline-block;
		position: relative;
		top: -10px;
		font-size: x-small;
		color: #80808096;
	}
</style>
<?php echo $footer; ?>