<?php 
extract($order['details']);
extract($order['customer']);
extract($text);
?>
<div class="tab-pane" id="order-<?= $order_id ?>">
	<div class="page-header">
		<div class="container-fluid">
			<div class="pull-left">
				<a href="#" data-toggle="tooltip" title="Refresh" class="btn btn-info refresh-order" data-order-id="<?= $order_id ?>" ><i class="fa fa-refresh"></i></a>
				<a href="#" data-toggle="tooltip" title="<?= $text_remove_button_info ?>" class="btn btn-warning remove-order" data-order-id="<?= $order_id ?>" ><i class="fa fa-eye-slash"></i></a>
			</div>
			<div class="pull-right">
				<a href="<?= $order['view_link']; ?>" target="order<?= $order_id ?>" data-toggle="tooltip" title="" class="btn btn-info" data-title="View"><i class="fa fa-eye"></i></a>
				<a href="<?= $invoice; ?>" target="_blank" data-toggle="tooltip" title="<?= $button_invoice_print; ?>" class="btn btn-info"><i class="fa fa-print"></i></a>
				<a href="<?= $shipping; ?>" target="_blank" data-toggle="tooltip" title="<?= $button_shipping_print; ?>" class="btn btn-info"><i class="fa fa-truck"></i></a>
				<a href="<?= $edit; ?>" target="e_order<?= $order_id ?>" data-toggle="tooltip" title="<?= $button_edit; ?>" class="btn btn-primary"><i class="fa fa-pencil"></i></a>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-sd-4 col-md-3">
			<div class="panel panel-default">
				<div class="panel-heading">
					<h3 class="panel-title"><i class="fa fa-shopping-cart"></i>
						<?= $text_order_detail; ?>
					</h3>
				</div>
				<table class="table">
					<tbody>
						<tr>
							<td><button data-toggle="tooltip" title="<?= $text_date_added; ?>" class="btn btn-info btn-xs"><i class="fa fa-calendar fa-fw"></i></button></td>
							<td>
								<?= "$order_date_added $order_time_added"; ?>
								<span class="time-elapsed label label-default" data-time="<?= "$order_datetime_added"; ?>"></span>
							</td>
						</tr>
						<tr>
							<td><button data-toggle="tooltip" title="<?= $entry_date_modified; ?>" class="btn btn-info btn-xs"><i class="fa fa-pencil fa-fw"></i></button></td>
							<td>
								<?= "$order_date_modified $order_time_modified"; ?>
								<span class="time-elapsed label label-info" data-time="<?= "$order_datetime_modified"; ?>"></span>
							</td>
						</tr>
						<tr>
							<td><button data-toggle="tooltip" title="<?= $text_payment_method; ?>" class="btn btn-info btn-xs"><i class="fa fa-credit-card fa-fw"></i></button></td>
							<td>
								<?= $payment_method; ?>
							</td>
						</tr>
						<tr>
							<td style="width: 1%;"><button data-toggle="tooltip" title="<?= $text_customer; ?>" class="btn btn-info btn-xs"><i class="fa fa-user fa-fw"></i></button></td>
							<td>
								<?php if ($customer) { ?>
								<a href="<?= $customer; ?>" target="_blank">
									<?= $firstname; ?>
									<?= $lastname; ?>
								</a>
								<?php } else { ?>
								<?= $firstname; ?>
								<?= $lastname; ?>
								<?php } ?>
							</td>
						</tr>
						<tr>
							<td><button data-toggle="tooltip" title="<?= $text_customer_group; ?>" class="btn btn-info btn-xs"><i class="fa fa-group fa-fw"></i></button></td>
							<td>
								<?= $customer_group; ?>
							</td>
						</tr>
						<tr>
							<td><button data-toggle="tooltip" title="<?= $text_email; ?>" class="btn btn-info btn-xs"><i class="fa fa-envelope-o fa-fw"></i></button></td>
							<td>
								<a href="mailto:<?= $email; ?>">
									<?= $email; ?>
								</a>
							</td>
						</tr>
						<tr>
							<td><button data-toggle="tooltip" title="<?= $text_telephone; ?>" class="btn btn-info btn-xs"><i class="fa fa-phone fa-fw"></i></button></td>
							<td>
								<?= $telephone; ?>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="panel panel-default">
				<div class="panel-body">
					<table class="table table-bordered">
						<thead>
							<tr>
								<td style="width: 50%;" class="text-left">
									<?= $text_payment_address; ?>
								</td>
								<?php if ($shipping_method) { ?>
								<td style="width: 50%;" class="text-left">
									<?= $text_shipping_address; ?>
								</td>
								<?php } ?>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="text-left">
									<?= $payment_address; ?>
								</td>
								<?php if ($shipping_method) { ?>
								<td class="text-left">
									<?= $shipping_address; ?>
								</td>
								<?php } ?>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="col-sm-8 col-md-9">
			<div class="panel panel-default">
				<div class="panel-heading">
					<h3 class="panel-title"><i class="fa fa-info-circle"></i>
						<?= sprintf($text_order,$order_id); ?>
					</h3>
				</div>
				<div class="panel-body">
					<table class="table table-bordered">
						<thead>
							<tr>
								<td class="text-left">
									<?= $column_product; ?>
								</td>
								<td class="text-left">
									<?= $column_model; ?>
								</td>
								<td class="text-right">
									<?= $column_quantity; ?>
								</td>
								<td class="text-right">
									<?= $column_price; ?>
								</td>
								<td class="text-right">
									<?= $column_total; ?>
								</td>
							</tr>
						</thead>
						<tbody>
							<?php foreach ($products as $product) { ?>
							<tr>
								<td class="text-left">
									<a href="<?= $product['href']; ?>" target="product">
										<?= $product['name']; ?>
									</a>
									<?php foreach ($product['option'] as $option) { ?>
									<br />
									<?php if ($option['type'] != 'file') { ?> &nbsp;
									<small> - <?= $option['name']; ?>: <?= $option['value']; ?></small>
									<?php } else { ?> &nbsp;
									<small> - <?= $option['name']; ?>: <a href="<?= $option['href']; ?>" target="_blank"><?= $option['value']; ?></a></small>
									<?php } ?>
									<?php } ?>
								</td>
								<td class="text-left">
									<?= $product['model']; ?>
								</td>
								<td class="text-right">
									<?= $product['quantity']; ?>
								</td>
								<td class="text-right">
									<?= $product['price']; ?>
								</td>
								<td class="text-right">
									<?= $product['total']; ?>
								</td>
							</tr>
							<?php } ?>
							<?php foreach ($vouchers as $voucher) { ?>
							<tr>
								<td class="text-left">
									<a href="<?= $voucher['href']; ?>">
										<?= $voucher['description']; ?>
									</a>
								</td>
								<td class="text-left"></td>
								<td class="text-right">1</td>
								<td class="text-right">
									<?= $voucher['amount']; ?>
								</td>
								<td class="text-right">
									<?= $voucher['amount']; ?>
								</td>
							</tr>
							<?php } ?>
							<?php foreach ($totals as $total) { ?>
							<tr>
								<td colspan="4" class="text-right">
									<?= $total['title']; ?>
								</td>
								<td class="text-right">
									<?= $total['text']; ?>
								</td>
							</tr>
							<?php } ?>
						</tbody>
					</table>
					<?php if ($comment) { ?>
					<table class="table table-bordered">
						<thead>
							<tr>
								<td>
									<?= $text_comment; ?>
								</td>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									<?= $comment; ?>
								</td>
							</tr>
						</tbody>
					</table>
					<?php } ?>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-6">
			<div class="panel panel-default">
				<div class="panel-heading">
					<h3 class="panel-title"><i class="fa fa-comment-o"></i>
						<?= $text_history; ?>
					</h3>
				</div>
				<div class="panel-body">
					<ul class="nav nav-tabs">
						<li class="active">
							<a href="#tab-history-<?= $order_id ?>" data-toggle="tab">
								<?= $tab_history; ?>
							</a>
						</li>
						<li>
							<a href="#tab-additional-<?= $order_id ?>" data-toggle="tab">
								<?= $tab_additional; ?>
							</a>
						</li>
						<?php foreach ($tabs as $tab) { ?>
							<li>
								<a href="#tab-<?= $tab['code']; ?>" data-toggle="tab">
									<?= $tab['title']; ?>
								</a>
							</li>
						<?php } ?>
					</ul>
					<div class="tab-content">
						<div class="tab-pane active" id="tab-history-<?= $order_id ?>">
							<div id="history-<?= $order_id ?>" class="history data-order-id="<?= $order_id ?>">
							<?= $history ?>
						</div>
						<br />
						<fieldset>
							<legend>
								<?= $text_history_add; ?>
							</legend>
							<form id="history-<?= $order_id ?>-form" class="form-horizontal">
								<div class="form-group">
									<label class="col-sm-2 control-label" for="input-order-status"><?= $entry_order_status; ?></label>
									<div class="col-sm-10">
										<select name="order_status_id" id="input-order-status" class="form-control">
											<?php foreach ($order_statuses as $order_statuses) { ?>
												<?php if ($order_statuses['order_status_id'] == $order_status_id) { ?>
													<option value="<?= $order_statuses['order_status_id']; ?>" selected="selected"><?= $order_statuses['name']; ?></option>
												<?php } else { ?>
													<option value="<?= $order_statuses['order_status_id']; ?>"><?= $order_statuses['name']; ?></option>
												<?php } ?>
											<?php } ?>
										</select>
									</div>
								</div>
								<div class="form-group">
									<label class="col-sm-2 control-label" for="input-override"><span data-toggle="tooltip" title="<?= $help_override; ?>"><?= $entry_override; ?></span></label>
									<div class="col-sm-10">
										<input type="checkbox" name="override" value="1" id="input-override" />
									</div>
								</div>
								<div class="form-group">
									<label class="col-sm-2 control-label" for="input-notify"><?= $entry_notify; ?></label>
									<div class="col-sm-10">
										<input type="checkbox" name="notify" value="1" id="input-notify" />
									</div>
								</div>
								<div class="form-group">
									<label class="col-sm-2 control-label" for="input-comment"><?= $entry_comment; ?></label>
									<div class="col-sm-10">
										<textarea name="comment" rows="6" id="input-comment" class="form-control"></textarea>
									</div>
								</div>
							</form>
						</fieldset>
						<div class="text-right">
							<button class="order-history-add btn btn-primary" data-id="<?= $order_id ?>" data-loading-text="<?= $text_loading; ?>"><i class="fa fa-plus-circle"></i> <?= $button_history_add; ?></button>
						</div>
					</div>
					<div class="tab-pane" id="tab-additional-<?= $order_id ?>">
						<?php if ($account_custom_fields) { ?>
							<div class="table-responsive">
								<table class="table table-bordered">
									<thead>
									<tr>
										<td colspan="2">
											<?= $text_account_custom_field; ?>
										</td>
									</tr>
									</thead>
									<tbody>
									<?php foreach ($account_custom_fields as $custom_field) { ?>
										<tr>
											<td>
												<?= $custom_field['name']; ?>
											</td>
											<td>
												<?= $custom_field['value']; ?>
											</td>
										</tr>
									<?php } ?>
									</tbody>
								</table>
							</div>
						<?php } ?>
						<?php if ($payment_custom_fields) { ?>
							<div class="table-responsive">
								<table class="table table-bordered">
									<thead>
									<tr>
										<td colspan="2">
											<?= $text_payment_custom_field; ?>
										</td>
									</tr>
									</thead>
									<tbody>
									<?php foreach ($payment_custom_fields as $custom_field) { ?>
										<tr>
											<td>
												<?= $custom_field['name']; ?>
											</td>
											<td>
												<?= $custom_field['value']; ?>
											</td>
										</tr>
									<?php } ?>
									</tbody>
								</table>
							</div>
						<?php } ?>
						<?php if ($shipping_method && $shipping_custom_fields) { ?>
							<div class="table-responsive">
								<table class="table table-bordered">
									<thead>
									<tr>
										<td colspan="2">
											<?= $text_shipping_custom_field; ?>
										</td>
									</tr>
									</thead>
									<tbody>
									<?php foreach ($shipping_custom_fields as $custom_field) { ?>
										<tr>
											<td>
												<?= $custom_field['name']; ?>
											</td>
											<td>
												<?= $custom_field['value']; ?>
											</td>
										</tr>
									<?php } ?>
									</tbody>
								</table>
							</div>
						<?php } ?>
						<div class="table-responsive">
							<table class="table table-bordered">
								<thead>
								<tr>
									<td colspan="2">
										<?= $text_browser; ?>
									</td>
								</tr>
								</thead>
								<tbody>
								<tr>
									<td>
										<?= $text_ip; ?>
									</td>
									<td>
										<?= $ip; ?>
									</td>
								</tr>
								<?php if ($forwarded_ip) { ?>
									<tr>
										<td>
											<?= $text_forwarded_ip; ?>
										</td>
										<td>
											<?= $forwarded_ip; ?>
										</td>
									</tr>
								<?php } ?>
								<tr>
									<td>
										<?= $text_user_agent; ?>
									</td>
									<td>
										<?= $user_agent; ?>
									</td>
								</tr>
								<tr>
									<td>
										<?= $text_accept_language; ?>
									</td>
									<td>
										<?= $accept_language; ?>
									</td>
								</tr>
								</tbody>
							</table>
						</div>
					</div>
					<?php foreach ($tabs as $tab) { ?>
						<div class="tab-pane" id="tab-<?= $tab['code']; ?>">
							<?= $tab['content']; ?>
						</div>
					<?php } ?>
				</div>
			</div>
		</div>
		</div>
		<?php if($customer_histories){ ?>
			<div class="col-sm-6">
				<div class="panel panel-default custommer-history" data-customer="<?= $customer_id ?>">
					<div class="panel-heading">
						<h3 class="panel-title"><i class="fa fa-comment-o"></i>
							<?= "Customer History"; ?>
						</h3>
					</div>
					<div class="panel-body">
						<div class="history history-<?= $customer_id?>">
							<?= $customer_histories ?>
						</div>
						<div class="form-group">
							<textarea name="comment" rows="6" placeholder="<?= $entry_comment; ?>" class="form-control"></textarea>
						</div>
						<button  data-loading-text="<?= $text_loading; ?>" class="customer-history-add btn btn-primary" data-id="<?= $customer_id ?>" data-store-id="<?= $store_id ?>"><i class="fa fa-plus-circle"></i> <?= $button_history_add; ?></button>
					</div>
				</div>
			</div>
		<?php } ?>
	</div>
</div>
