<?php

class ModelTwOrderslive extends Model{
	public function getOrdersAfter($order_id = NULL) {
		if($order_id){
		$sql = "SELECT o.order_id, o.date_added, o.date_modified
			FROM `" . DB_PREFIX . "order` o
			WHERE o.order_status_id > '0'
			AND o.order_id >".(int)$order_id;
		} else {
			$sql = "SELECT o.order_id, o.date_added, o.date_modified
					FROM `" . DB_PREFIX . "order` o
					WHERE o.order_status_id > '0'
					ORDER BY o.order_id DESC
					LIMIT 1";
		}
		$query = $this->db->query($sql);
		return $query->rows;
	}
}