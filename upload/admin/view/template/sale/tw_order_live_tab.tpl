<?php
	extract($order['details']);
	extract($order['customer']);
	extract($text);

	if ($order_processing) {
        $label = "label-warning";
        $order_group = 1;
    } else if ($order_complete) {
        $label = "label-success";
        $order_group = 2;
    } else {
        $label = "label-default";
        $order_group = 3;
    }
?>
<li id="order-tab-<?= $order_id ?>"  class="order-tab"
data-timestamp="<?= strtotime($order_datetime_modified) ?>" 
data-order-id="<?= $order_id ?>"
data-status-id="<?= $order_status_id ?>"
data-order-group="<?= $order_group ?>">
    <a id="order-link-<?= $order_id ?>" 
        href="#order-<?= $order_id ?>"  
        data-toggle="tab">
        <div class="pull-left" style="margin-right:5px;">
            <h1><span class="badge"><?= $order_id ?></span></h1>
        </div>
        <div>
            <div><?= "$firstname $lastname"; ?></div>
            <div><span class="label <?= $label ?>">
					<?= $order_status ?>
	            </span>
            </div>
        </div>
    </a>
</li>