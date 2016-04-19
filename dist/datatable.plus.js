/**
 * DataTable Chart Button
 * display chart html content in modal dialog
 * @depends Bootstrap.modal
 */
 (function($) {
	 
	$.fn.dataTable.ext.buttons.modal = {
		text: "Modal",
		index: 0,
		action: function (e, dt, node, config) {
			var data = dt.rows('.selected').data(), value;
			if (data.length < 1 && config.default === false) {
				return false;
			}				
			value = data.length < 1 ? (config.default || "") : data[0][config.index];
			$.get((config.url + '').replace(/\:\?/g, value)).then(function (html) {
				var buttons = [];
				if (config.submit === true) {
					buttons.push({
						text: 'Submit',
						class: "btn btn-primary modal-submit",
						type: "submit"
					});
				}
				buttons.push({
					text: 'Close',
					class: "btn btn-default",
					"data-dismiss": "modal"
				});
				var $modal = modal(config.title || (config.text || "Modal"), html, buttons, 'large');
				if (config.submit === true) {
					$modal.on('click', '.modal-submit', function() {
						$modal.find('form').ajaxSubmit({
							success: function(text, state, xhr) {
								if (xhr.status == 200) {
									$modal.find('.modal-submit').remove();
								}
								$modal.find('.modal-body').html(text);
							}
						});
						return false;
					});
				}
			});
		}
	};


	/**
	 * 
	 * @param string title
	 * @param {type} message
	 * @param {type} buttons
	 * @param {type} modalSize
	 * @returns {undefined}
	 */
	function modal(title, message, buttons, modalSize) {
		var tempButtons = [];
		var map = {
			size: {
				large: 'modal-lg',
				small: 'modal-sm'
			}
		};
		modalSize = map.size[modalSize] ? ' ' + map.size[modalSize] : '';
		$.each(buttons, function (k, v) {
			if (!v.text)
				return;
			var data = [];
			if (!v.type) {
				v.type = 'button';
			}
			$.each(v, function (attr, value) {
				if (attr == 'text')
					return;
				data.push(attr + '="' + value + '"');
			});
			tempButtons.push('<button ' + data.join(" ") + '>' + v.text + '</button>');
		});
		var $dialog = $('<div class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog' + modalSize + '"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">' + title + '</h4></div><div class="modal-body">' + message + '</div><div class="modal-footer">' + tempButtons.join('') + '</div></div></div></div>');
		$('body').append($dialog);
		return $dialog.modal().on('hidden.bs.modal', function (e) {
			$dialog.remove();
		});
	}

	function error(message) {
		return modal("Error", message, [
			{
				text: "Close",
				class: "btn btn-default",
				"data-dismiss": "modal"
			}
		]);
	}

	//$.fn.DataTable.Api.register('selected()', function (group, selector) {
	//	return this.rows('.selected').data();
	//});

	$.fn.exDataTable = function (options) {
		var $table = this;
		var footer = "", tmp = [];
		// footer ---------- BEGIN ----------
		if ((options.footer == true || options.footerSearch == true) && options.columns) {
			$.each(options.columns, function () {
				tmp.push('<th>' + this.title + '</th>');
			});
			footer = '<tfoot>' + tmp.join('') + '</tfoot>';
		}
		// footer ---------- END ----------
		var table = this.each(function () {
			$(this).append(footer);
		}).DataTable(options);

		// selectable ---------- BEGIN ----------

		if (options.selectable === true) {
			this.find('tbody').off('click', 'tr').on('click', 'tr', function () {
				$(this).toggleClass('selected').siblings().removeClass('selected');
			});
		}
		// selectable ---------- END ----------
		// footerSearch ---------- BEGIN ----------
		if (options.footerSearch == true) {
			$(document).ready(function () {
				$table.find('tfoot th').each(function (i, v) {
					var title = $(this).text();
					$(this).html('<input type="text" placeholder="Search ' + title + '" class="footer-search" data-order="' + i + '" />');
				});
				$table.off('init.dt').on('init.dt', function (e) {
					var that = $(this).DataTable();
					var timer = null;
					$(this).off('keyup change').on('keyup change', '.footer-search', function () {
						var input = this;
						var order = $(input).data('order');
						if (timer) {
							clearTimeout(timer);
						}
						timer = setTimeout(function () {
							if (that.columns(order).search() !== input.value) {
								that
												.columns(order)
												.search(input.value)
												.draw();
							}
							clearTimeout(timer);
							timer = null;
						}, 500);
					});
				});
			});
		}
		// footerSearch ---------- END ----------
		return table;
	};
})(jQuery);