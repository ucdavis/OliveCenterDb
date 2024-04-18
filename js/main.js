MyApp = {};
MyApp.spreadsheetData = [];
MyApp.keywords = [];
MyApp.headerData = [
  { sTitle: "University" },
  { sTitle: "State" },
  { sTitle: "Public/Private" },
  { sTitle: "Type" },
  { sTitle: "Name" },
  { sTitle: "Focus Areas" },
  { sTitle: "Center focus details" },
];
// filter options start here
MyApp.filterIndexes = { state: 1, type: 3 };
MyApp.States = [];
MyApp.Types = [];
MyApp.Publicprivates = [];

String.prototype.trunc = function (n) {
  return this.substr(0, n - 1) + (this.length > n ? "&hellip;" : "");
};

$(function () {
  var url =
    "https://sheets.googleapis.com/v4/spreadsheets/1PxbyURdyAW2588lBbh75v0xlx0zB7mEilzgJqH0Kp9s/values/Database_directory?key=AIzaSyA3dk7j-VOX78HlLFqsOEHNL5rDljrMtIA";
  $.getJSON(url, {}, function (data) {
    for (let i = 1; i < data["values"].length; i++) {
      const currRow = data["values"][i];
      var university = currRow[0];
      var state = currRow[1];
      var publicprivate = currRow[2];
      var type = currRow[3];
      var link = currRow[4];
      var focusareas = currRow[5];
      var centerfocusareas = currRow[6] || "";
      var keyword = currRow[7] || "";

      MyApp.spreadsheetData.push([
        GenerateTitleColumn(university, link),
        state,
        publicprivate,
        type,
        link,
        focusareas,
        centerfocusareas,
        keyword,
      ]);
      // filters step two
      if ($.inArray(state, MyApp.States) === -1 && state.length !== 0) {
        MyApp.States.push(state);
      }
      if ($.inArray(type, MyApp.Types) === -1 && type.length !== 0) {
        MyApp.Types.push(type);
      }
      if (
        $.inArray(publicprivate, MyApp.Publicprivates) === -1 &&
        publicprivate.length !== 0
      ) {
        MyApp.Publicprivates.push(publicprivate);
      }
    }

    createDataTable();
    addFilters();
  });
});

function GenerateTitleColumn(university, link) {
  //entry value from spreadsheet
  return (
    "<a href='" +
    link +
    "' class='abstract-popover' data-toggle='popover'>" +
    university +
    "</a>"
  );
}

function addFilters() {
  // filters step three
  var $statesfilter = $("#state");

  $.each(MyApp.States, function (key, val) {
    $statesfilter.append(
      '<li><label><input type="checkbox" name="' +
        val +
        '"> ' +
        val +
        "</label></li>"
    );
  });
  var $typesfilter = $("#type");

  $.each(MyApp.Types, function (key, val) {
    $typesfilter.append(
      '<li><label><input type="checkbox" name="' +
        val +
        '"> ' +
        val +
        "</label></li>"
    );
  });
  var $publicprivatefilter = $("#publicprivate");

  $.each(MyApp.Publicprivates, function (key, val) {
    $publicprivatefilter.append(
      '<li><label><input type="checkbox" name="' +
        val +
        '"> ' +
        val +
        "</label></li>"
    );
  });

  $(".filterrow").on("click", "ul.filterlist", function (e) {
    var filterRegex = "";
    var filterName = this.id;
    var filterIndex = MyApp.filterIndexes[filterName];

    var filters = [];
    $("input", this).each(function (key, val) {
      if (val.checked) {
        if (filterRegex.length !== 0) {
          filterRegex += "|";
        }

        filterRegex += val.name; //Use the hat and dollar to require an exact match
      }
    });

    console.log(filterRegex);
    MyApp.oTable.fnFilter(filterRegex, filterIndex, true, false);
    displayCurrentFilters();
  });

  $("#clearfilters").click(function (e) {
    e.preventDefault();

    $(":checkbox", $filter).each(function () {
      this.checked = false;
    });

    $filter.change();
  });
}

function displayCurrentFilters() {
  var $filterAlert = $("#filters");

  var filters = "";

  $(":checked", "#filter_elements").each(function () {
    if (filters.length !== 0) {
      filters += " + ";
    }
    filters += "<strong>" + this.name + "</strong>";
  });

  if (filters.length !== 0) {
    var alert = $(
      "<div class='alert alert-info'><strong>Filters</strong><p>You are filtering on " +
        filters +
        "</p></div>"
    );

    $filterAlert.html(alert);
    $filterAlert[0].scrollIntoView(true);
  } else {
    $filterAlert.html(null);
  }
}

function createDataTable() {
  //Create a sorter that uses case-insensitive html content
  jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "link-content-pre": function (a) {
      return $(a).html().trim().toLowerCase();
    },

    "link-content-asc": function (a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    },

    "link-content-desc": function (a, b) {
      return a < b ? 1 : a > b ? -1 : 0;
    },
  });

  MyApp.oTable = $("#spreadsheet").dataTable({
    aoColumnDefs: [{ sType: "link-content", aTargets: [0] }],
    iDisplayLength: 20,
    bLengthChange: false,
    aaData: MyApp.spreadsheetData,
    aoColumns: MyApp.headerData,
  });
}
