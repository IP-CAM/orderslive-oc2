<?= $header ?>
	<?= $column_left ?>
		<div id="content">
			<nav class="navbar navbar-default">
				<div class="container-fluid">
					<div class="navbar-header">
						<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#tw-orders-live-nav">
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
						
							<div class="btn-group btn-group-xs" data-toggle="buttons">
								<label class="btn btn-default active">
									<input type="radio" name="order_filter" value="" autocomplete="off"><?= $text_filter_all ?>
								</label>
								<label class="btn btn-success">
									<input type="radio" name="order_filter" value="complete" autocomplete="off"><?= $text_filter_complete ?>
								</label>
								<label class="btn btn-warning">
									<input type="radio" name="order_filter" value="pending" autocomplete="off" checked><?= $text_filter_pending ?>
								</label>
								<label class="btn btn-misc">
									<input type="radio" name="order_filter" value="misc" autocomplete="off"><?= $text_filter_misc ?>
								</label>
							</div>
							<div class="btn-group btn-group-xs" data-toggle="buttons">
								<label class="btn btn-default active"  onclick="sortOrders('timestamp')">
									<input type="radio" name="order_sort_key" value="timestamp" autocomplete="off">Date Modified
								</label>
								<label class="btn btn-default" onclick="sortOrders('status-id')">
									<input type="radio" name="order_sort_key" value="status-id" autocomplete="off">Status
								</label>
								<label class="btn btn-default" onclick="sortOrders('order-id')">
									<input type="radio" name="order_sort_key" value="order-id" autocomplete="off" checked>Order ID
								</label>
								<label class="btn btn-default" onclick="sortOrders('order-group')">
									<input type="radio" name="order_sort_key" value="order-group" autocomplete="off">Status Group
								</label>
							</div>
						</div>
					</div>
				</div>
			</nav>

			<div class="container-fluid">
				<div class="row">
					<div class="col-sm-3 col-md-2">
						<ul id="order-tabs" class="nav nav-pills nav-stacked">
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
<script src="view/javascript/tw/muuri.min.js" type="text/javascript"></script>

<script>
var order_tabs;
$(document).ready(function(){
	order_tabs = new Muuri('#order-tabs',{
		items : '.order-tab',
		itemHiddenClass : 'hidden',
		sortData: {
			timestamp: function (item, element) {
				return $(element).data('timestamp');
			},
			order_status_id: function (item, element) {
				return $(element).data('status-id');
			},
			order_group: function (item, element) {
				return $(element).data('order-group');
			},
			order_id: function (item, element) {
				return $(element).data('order-id');
			},
		}
	});
})

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
moment.locale("<?= $locale ?>");

//Extract all the needed php variables uses but the scripts
var token = '<?= $token ?>';
var last_order_id = window.last_order_id ? window.last_order_id : 0;
var tw_live_timestamp = window.tw_live_timestamp ? window.tw_live_timestamp : 0;
var api_token = '';
var catalog = '<?= $catalog ?>';
var api_ip = '<?= $api_ip ?>';
var api_key = '<?= $api_key ?>';

//Array that hold the ids of the hiden/deleted orders. Used when undoing
var order_data_undo_array = new Array();
</script>


<script src="view/javascript/tw/orderslive.js" type="text/javascript"></script>

<style>
	.new {
		background: #b9fdb9;
	}

	#order-tabs{
		position: relative;
	}

	.order-tab{
		width: 100%;
		height: 55px;
		position: absolute!important; /* For muuri... */
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
	.btn-misc{
		background-color: #777;
		color: white!important;
	}
</style>
<?php echo $footer; ?>