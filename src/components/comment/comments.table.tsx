import { useEffect, useState } from 'react';
import { Table, Button, notification, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export interface IComments {
    "_id": string;
    "content": string;
    "moment": number,
    "user": {
        "_id": string;
        "email": string;
        "name": string;
        "role": string;
        "type": string;
    },
    "track": {
        "_id": string;
        "title": string;
        "description": string;
        "trackUrl": string;
    }
    "isDeleted": boolean;
    "__v": number;
    "createdAt": string;
    "updatedAt": string;
}

const CommentsTable = () => {

    const [listComments, setListComments] = useState<IComments[]>([]);


    const access_token = localStorage.getItem("access_token") as string;


    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0
    })


    //METHOD:
    useEffect(() => {
        //update
        getData();
    }, []);

    //Promise
    const getData = async () => {
        const res = await fetch(
            `http://localhost:8000/api/v1/comments?current=${meta.current}&pageSize=${meta.pageSize}`,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            })
        const d = await res.json();
        if (!d.data) {
            notification.error({
                message: JSON.stringify(d.message)
            })
        }
        console.log(">>> check data: ", d);
        setListComments(d?.data?.result)
        setMeta({
            current: d?.data?.meta?.current,
            pageSize: d?.data?.meta?.pageSize,
            pages: d?.data?.meta?.pages,
            total: d?.data?.meta?.total
        })
    }

    const confirm = async (comment: IComments) => {
        const res = await fetch(
            `http://localhost:8000/api/v1/comments/${comment._id}`,
            {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            })

        const d = await res.json();
        if (d.data) {
            notification.success({
                message: "Xóa 1 comment thành công."
            })
            await getData();
        } else {
            notification.error({
                message: JSON.stringify(d.message)
            })
        }
    };

    const columns: ColumnsType<IComments> = [
        {
            title: 'STT',
            width: '5%',
            render: (value, record, index) => {
                return (
                    <div>{((meta.current - 1) * meta.pageSize) + index + 1}</div>
                )
            }
        },
        {
            title: 'Content',
            width: '50%',
            dataIndex: 'content'
        },
        {
            title: 'Track',
            width: '15%',
            dataIndex: ['track', 'title']
        },
        {
            title: 'User',
            width: '20%',
            dataIndex: ['user', 'email']
        },
        {
            title: 'Actions',
            width: '10%',
            render: (value, record) => {

                return (
                    <div>
                        {/* <button onClick={() => {
                            setDataUpdate(record);
                            setIsUpdateModalOpen(true)
                        }}>Edit</button> */}

                        <Popconfirm
                            title="Delete the comment"
                            description={`Are you sure to delete this comment?`}
                            onConfirm={() => confirm(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                style={{ marginLeft: 20 }}
                                danger>
                                Delete
                            </Button>
                        </Popconfirm>
                    </div>)
            }
        }
    ]


    const handleOnChange = async (page: number, pageSize: number) => {
        const res = await fetch(
            `http://localhost:8000/api/v1/comments?current=${page}&pageSize=${pageSize}`,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            })

        const d = await res.json();
        if (!d.data) {
            notification.error({
                message: JSON.stringify(d.message)
            })
        }
        setListComments(d?.data?.result)
        setMeta({
            current: d?.data?.meta?.current,
            pageSize: d?.data?.meta?.pageSize,
            pages: d?.data?.meta?.pages,
            total: d?.data?.meta?.total
        })
    }

    return (
        <div>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <h2>Table Tracks</h2>
                {/* <div>
                    <Button
                        icon={<PlusOutlined />}
                        type={"primary"}
                        onClick={() => setIsCreateModalOpen(true)}
                    >Add new</Button>
                </div> */}

            </div>

            <Table
                columns={columns}
                dataSource={listComments}
                rowKey={"_id"}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    onChange: (page: number, pageSize: number) => handleOnChange(page, pageSize),
                    showSizeChanger: true
                }}
            />
        </div>
    )
}

export default CommentsTable;