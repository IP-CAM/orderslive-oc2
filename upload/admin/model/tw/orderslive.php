<?php

class ModelTwOrderslive extends Model{
	public function getOrdersAfterOrderId($order_id = NULL) {
		if($order_id){
		$sql = "SELECT o.order_id, o.date_added, o.date_modified
			FROM `" . DB_PREFIX . "order` o
			WHERE o.order_status_id > 0
			AND o.order_id >".(int)$order_id;
		} else {
			$sql = "SELECT o.order_id, o.date_added, o.date_modified
					FROM `" . DB_PREFIX . "order` o
					WHERE o.order_status_id > 0
					ORDER BY o.order_id DESC
					LIMIT 1";
		}
		$query = $this->db->query($sql);
		return $query->rows;
	}

	public function getOrdersNewerThan($timestamp = 0){
		if(!$timestamp){
			return array($this->getLatestOrder());
		}

		$query = "SELECT o.order_id, o.date_added, o.date_modified
			FROM `" . DB_PREFIX . "order` o
			WHERE o.order_status_id > 0
			AND `date_modified` > FROM_UNIXTIME($timestamp)";
		return $this->db->query($query)->rows;
	}

	public function getLatestOrder(){
		return $this->db->query("SELECT o.order_id, o.date_added, o.date_modified
			FROM `" . DB_PREFIX . "order` o
			WHERE o.order_status_id > 0
			ORDER BY `date_modified` DESC
			LIMIT 1")->rows[0];
	}
}