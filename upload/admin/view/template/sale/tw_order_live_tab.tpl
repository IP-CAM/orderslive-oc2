<?php
	extract($order['details']);
	extract($order['customer']);
	extract($text);

	if($order_processing) $label = "label-warning";
	else if($order_complete) $label = "label-success";
	else $label = "label-default";
?>

<li role="presentation" id="order-tab-<?= $order_id ?>">
    <a id="order-link-<?= $order_id ?>" href="#order-<?= $order_id ?>" aria-controls="order-<?= $order_id ?>" role="tab"
                                          data-toggle="tab" aria-expanded="true">
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