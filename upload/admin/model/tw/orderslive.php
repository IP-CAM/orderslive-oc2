<?php

class ModelTwOrderslive extends Model{
	public function getOrdersNewerThan($timestamp = 0){
		if(!$timestamp){
			return array($this->getLatestOrder());
		}

		$query = "SELECT o.order_id, o.date_added, o.date_modified
			FROM `" . DB_PREFIX . "order` o
			WHERE o.order_status_id > 0
			AND o.`date_modified` > '" . date("Y-m-d H:i:s",$timestamp) . "'";
		return $this->db->query($query)->rows;
	}

	public function getMoreOrders($page){
		$start = (int)$page * 10;
		$query = "SELECT o.order_id, o.date_added, o.date_modified
			FROM `" . DB_PREFIX . "order` o
			WHERE o.order_status_id > 0
			LIMIT $start,10";
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