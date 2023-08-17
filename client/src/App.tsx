import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { InputRef } from "antd";
import { Button, Form, Input, Popconfirm, Table, Checkbox } from "antd";
import type { FormInstance } from "antd/es/form";
import {
  IBatchOperation,
  IPlan,
  OperationType,
  TBatchRequestBody,
} from "./interface";
import axios from "axios";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof IPlan;
  record: IPlan;
  handleSave: (record: IPlan) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<IPlan[]>([]);
  const [operations, setOperations] = useState<IBatchOperation[]>([]);

  const [count, setCount] = useState(2);

  const handleDelete = (_id: string) => {
    console.log("deleting", _id);

    const newData = dataSource.filter((item) => item._id !== _id);
    setDataSource(newData);
    setOperations((oldState) => {
      const oldData = structuredClone(oldState);
      const createdOrUpdatedDeleted = oldData
        .filter(
          (operation) =>
            operation.action === OperationType.CREATE ||
            operation.action === OperationType.UPDATE
        )
        .find((operation) => operation.data?._id === _id);

      if (createdOrUpdatedDeleted) {
        return oldData.filter(
          (operation) =>
            operation.action === OperationType.UPDATE ||
            operation.data?._id !== _id
        );
      }
      return [
        ...oldData,
        {
          action: OperationType.DELETE,
          id: _id,
        },
      ];
    });
  };

  const handleAdd = () => {
    const newData: IPlan = {
      _id: String(Date.now()),
      name: "Dummy",
      height: 0,
      length: 0,
      quantity: 0,
      stackable: false,
      tiltable: false,
      weight: 0,
      width: 0,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
    setOperations((oldState) => [
      ...oldState,
      {
        action: OperationType.CREATE,
        data: newData,
      },
    ]);
  };

  const handleSave = useCallback(
    (row: IPlan) => {
      const newData = [...dataSource];
      const index = newData.findIndex((item) => row._id === item._id);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      setDataSource(newData);

      setOperations((oldState) => {
        structuredClone(oldState);
        const oldData = structuredClone(oldState);

        const createdUpdated = oldData
          .filter((operation) => operation.action === OperationType.CREATE)
          .find((operation) => operation.data?._id === row._id);

        if (createdUpdated) {
          return oldData.map((operation) => {
            if (
              operation.action === OperationType.CREATE &&
              operation.data?._id === row._id
            ) {
              return { ...operation, data: row };
            }
            return operation;
          });
        }

        const updatedUpdated = oldData
          .filter((operation) => operation.action === OperationType.UPDATE)
          .find((operation) => operation.id === row._id);

        if (updatedUpdated) {
          return oldData.map((operation) => {
            if (
              operation.action === OperationType.UPDATE &&
              operation.id === row._id
            ) {
              return { ...operation, data: row };
            }
            return operation;
          });
        }
        return [
          ...oldData,
          {
            action: OperationType.UPDATE,
            id: row._id,
            data: row,
          },
        ];
      });
    },
    [dataSource]
  );
  const handleCheckboxChange = useCallback(
    (id: string, key: keyof IPlan, val: boolean) => {
      const plan = dataSource.find((plan) => plan._id === id);
      if (plan) {
        handleSave({ ...plan, [key]: val });
      }
    },
    [dataSource, handleSave]
  );

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
    {
      title: "name",
      dataIndex: "name",
      editable: true,
    },
    {
      title: "weight",
      dataIndex: "weight",
      editable: true,
    },
    {
      title: "height",
      dataIndex: "height",
      editable: true,
    },
    {
      title: "length",
      dataIndex: "length",
      editable: true,
    },
    {
      title: "quantity",
      dataIndex: "quantity",
      editable: true,
    },
    {
      title: "width",
      dataIndex: "width",
      editable: true,
    },
    {
      title: "stackable",
      dataIndex: "stackable",
      render: (_, record: { _id: string }) => (
        <Checkbox
          defaultChecked={_}
          value={_}
          onChange={(e) =>
            handleCheckboxChange(record._id, "stackable", e.target.checked)
          }
          key={record._id}
        />
      ),
    },
    {
      title: "tiltable",
      dataIndex: "tiltable",
      render: (_, record: { _id: string }) => (
        <Checkbox
          defaultChecked={_}
          value={_}
          onChange={(e) =>
            handleCheckboxChange(record._id, "tiltable", e.target.checked)
          }
          key={record._id}
        />
      ),
    },
    {
      title: "operation",
      dataIndex: "operation",
      render: (_, record: { _id: string }) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record._id)}
            key={record._id}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : (
          <React.Fragment key={record._id}></React.Fragment>
        ),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IPlan) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const loadPlans = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/plan");

      setDataSource(data.data);
    } catch (error) {
      alert(error);
    }
  }, []);

  const performBatchOperation = useCallback(async () => {
    setLoading(true);
    try {
      const filterOperations = operations.map((operation) => {
        if (operation.action === OperationType.CREATE) {
          delete operation.data?._id;
        }
        return operation;
      });
      await axios.post("/api/plan/batch", {
        operations: filterOperations,
      } as TBatchRequestBody);
      await loadPlans();
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  }, [operations, loadPlans]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  console.log("dataSource", dataSource);

  return (
    <div>
      <div
        style={{
          marginLeft: "auto",
          width: "100%",
          marginBottom: 16,
          display: "flex",
          gap: "16px",
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={handleAdd} type="primary">
          Add a row
        </Button>
        <Button
          onClick={performBatchOperation}
          type="primary"
          loading={loading}
          disabled={loading}
        >
          Save
        </Button>
      </div>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
      />
    </div>
  );
};

export default App;
