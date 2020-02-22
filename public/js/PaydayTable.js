/**
 * The class that is used for making tables
 * @extends Map
 */
export default class PaydayTable extends Map {
    /**
     * @param {Iterable<String>} columnTypes Name for each column
     * @param {Iterable<String>} rowTypes Name for each row
     * @param {Object} options
     * @param {String} options.tableClass  
     */
    constructor(columnTypes = [], rowTypes = [], options = {}) {
        super();

        const staticRows = new Map();
        for(const row of rowTypes) {
            staticRows.set(row, row.toUpperCase());
        }
        this.set("", staticRows);

        for(const column of columnTypes) {
            const rows = new Map();
            for(const row of rowTypes) {
                rows.set(row, { value: "" });
            }
            this.set(column, rows);
        }

        /**
         * Contains the names shown for the columns
         * @type {Map}
         */
        this.columnNames = new Map();
        for(const [key] of this) {
            this.columnNames.set(key, key.toUpperCase());
        }

        /**
         * Contains what CSS class it uses
         * @type {String}
         */
        this.tableClass = options.tableClass;
    }

    /**
     * Compares two columns and gives the second one some colors
     * @param {String} usedColumn The column that wont be colored
     * @param {String} selectedColumn The column that will be colored
     * @returns {PaydayTable}
     */
    compare(usedColumn, selectedColumn) {
        const using = this.get(usedColumn);
        const selected = this.get(selectedColumn);
        for(const [key, obj] of using) {
            if(!obj) continue;
            const newObj = selected.get(key);

            if(newObj.value > obj.value) {
                newObj.css = "more";
            } else if(newObj.value < obj.value) {
                newObj.css = "less";
            }

            selected.set(key, newObj);
        }
        return this;
    }

    /**
     * Adds rows to the column
     * @param {String} columnName The column that will have it's values changed
     * @param {Iterable<Iterable<Object>>} rows A 2d array which contains name of row and value 
     * @returns {PaydayTable}
     */
    addRows(columnName, [...rows]) {
        const col = this.get(columnName);

        for(const [row, value] of rows) {
            col.set(row, { 
                value: value < 0 ? 
                    0 : value
            });
        }
        return this;
    }

    /**
     * Adds columns to the rows
     * @param {String} rowName The row that will have it's values changed
     * @param {Iterable<Iterable<Object>>} columns A 2d array which contains name of column and value 
     * @returns {PaydayTable}
     */
    addColumns(rowName, [...columns]) {
        for(const [column, value] of columns) {
            this.get(column).set(rowName, { 
                value: value < 0 ? 
                    0 : value
            });
        }
        return this;
    }

    /**
     * Transforms this abstract table to a real HTML table
     * @returns {String}
     */
    toHTML() {
        let html = `<table${this.tableClass ? ` class="${this.tableClass}"`: ""}>
    <thead>
        <tr>`;
        for(const [,value] of this.columnNames) {
            html += `
            <td>${value}</td>`;
        }
        html += `
        </tr>
    </thead>
    <tbody>`;
        for(const [key, type] of this.get("")) {
            html += `
        <tr>
            <td>${type}</td>`;
            for(const [key2, col] of this) {
                if(key2 === "") continue;
                const obj = col.get(key);
                html += `
            <td${obj.css ? ` class=${obj.css}` : ""}>${obj.value}</td>`;
            }
            html += `
        </tr>`;
        }
        html += `
    </tbody>
</table>`;
        return html;
    }

    /**
     * Translates the table based on an object with key-value
     * @param {Object<String>} obj Each property should be an id of the static rows/columsn and have a value that is the translation
     */
    translate(obj = {}) {
        const staticRows = this.get("");
        for(const key in obj.rows) {
            if(staticRows.has(key)) staticRows.set(key, obj.rows[key]);
        }
        
        for(const key in obj.columns) {
            if(this.columnNames.has(key)) this.columnNames.set(key, obj.columns[key]);
        }
        return this;
    }
}
