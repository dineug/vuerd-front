import JSLog from '@/js/JSLog'

JSLog('store loaded', 'dataType')

// mysql5.7 dataType
const MySQL = {
  dataTypes: [
    // 숫자
    {
      name: 'BIT',
      type: 'Number'
    },
    {
      name: 'TINYINT',
      type: 'Number'
    },
    {
      name: 'BOOL',
      type: 'Number'
    },
    {
      name: 'BOOLEAN',
      type: 'Number'
    },
    {
      name: 'SMALLINT',
      type: 'Number'
    },
    {
      name: 'MEDIUMINT',
      type: 'Number'
    },
    {
      name: 'INT',
      type: 'Number'
    },
    {
      name: 'INTEGER',
      type: 'Number'
    },
    {
      name: 'BIGINT',
      type: 'Number'
    },
    {
      name: 'DECIMAL',
      type: 'Number'
    },
    {
      name: 'DEC',
      type: 'Number'
    },
    {
      name: 'FLOAT',
      type: 'Number'
    },
    {
      name: 'DOUBLE',
      type: 'Number'
    },

    // 날짜
    {
      name: 'DATE',
      type: 'Date'
    },
    {
      name: 'DATETIME',
      type: 'Date'
    },
    {
      name: 'TIMESTAMP',
      type: 'Date'
    },
    {
      name: 'TIME',
      type: 'Date'
    },
    {
      name: 'YEAR(4)',
      type: 'Date'
    },

    // 문자열
    {
      name: 'CHAR',
      type: 'String'
    },
    {
      name: 'VARCHAR',
      type: 'String'
    },
    {
      name: 'BINARY',
      type: 'String'
    },
    {
      name: 'VARBINARY',
      type: 'String'
    },
    {
      name: 'TINYBLOB',
      type: 'String'
    },
    {
      name: 'TINYTEXT',
      type: 'String'
    },
    {
      name: 'BLOB',
      type: 'String'
    },
    {
      name: 'TEXT',
      type: 'String'
    },
    {
      name: 'MEDIUMBLOB',
      type: 'String'
    },
    {
      name: 'MEDIUMTEXT',
      type: 'String'
    },
    {
      name: 'LONGBLOB',
      type: 'String'
    },
    {
      name: 'LONGTEXT',
      type: 'String'
    },
    {
      name: 'ENUM',
      type: 'String'
    },
    {
      name: 'SET',
      type: 'String'
    }
  ]
}

const Oracle = {
  dataTypes: [
    {
      name: 'CHAR',
      type: 'String'
    },
    {
      name: 'VARCHAR2',
      type: 'String'
    },
    {
      name: 'NCHAR',
      type: 'String'
    },
    {
      name: 'NVARCHAR2',
      type: 'String'
    },
    {
      name: 'CLOB',
      type: 'String'
    },
    {
      name: 'NCLOB',
      type: 'String'
    },
    {
      name: 'LONG',
      type: 'String'
    },
    {
      name: 'BLOB',
      type: 'String'
    },
    {
      name: 'BFILE',
      type: 'String'
    },
    {
      name: 'RAW',
      type: 'String'
    },
    {
      name: 'LONG RAW',
      type: 'String'
    },

    {
      name: 'NUMBER',
      type: 'Number'
    },

    {
      name: 'DATE',
      type: 'Date'
    }
  ]
}

export default {
  MySQL: MySQL.dataTypes,
  Oracle: Oracle.dataTypes
}
