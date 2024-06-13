import { useEffect, useState } from 'react';
// import '../../styles/users.css';
import { Table, Button, notification, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';

export interface ITracks {
    _id: string;
    title: string;
    description: string;
    category: string;
    imgUrl: string;
    trackUrl: string;
    countLike: number;
    countPlay: number;
    uploader: {
        _id: string;
        email: string;
        name: string;
        role: string;
        type: string;
    },
    isDeleted: boolean;
    __v: number;
    createdAt: string;
    updatedAt: string;
}

const TracksTable = () => {

    const [listTracks, setListTracks] = useState([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const [dataUpdate, setDataUpdate] = useState<null | ITracks>(null);


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
        getData()
    }, []);

    //Promise
    const getData = async () => {
        const res = await fetch(
            `http://localhost:8000/api/v1/tracks?current=${meta.current}&pageSize=${meta.pageSize}`,
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
        setListTracks(d?.data?.result)
        setMeta({
            current: d?.data?.meta?.current,
            pageSize: d?.data?.meta?.pageSize,
            pages: d?.data?.meta?.pages,
            total: d?.data?.meta?.total
        })
    }

    const confirm = async (track: ITracks) => {
        const res = await fetch(
            `http://localhost:8000/api/v1/tracks/${track._id}`,
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
                message: "Xóa track thành công."
            })
            await getData();
        } else {
            notification.error({
                message: JSON.stringify(d.message)
            })
        }
    };

    const columns: ColumnsType<ITracks> = [
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
            title: 'Title',
            width: '20%',
            dataIndex: 'title',
        },
        {
            title: 'Description',
            width: '25%',
            dataIndex: 'description',
        },
        {
            title: 'Category',
            width: '10%',
            dataIndex: 'category',
        },
        {
            title: 'Track Url',
            width: '10%',
            dataIndex: 'trackUrl',
        },
        {
            title: 'Uploader',
            width: '10%',
            dataIndex: ['uploader', 'name']
        },

        {
            title: 'Actions',
            width: '20%',
            render: (value, record) => {

                return (
                    <div>
                        {/* <button onClick={() => {
                            setDataUpdate(record);
                            setIsUpdateModalOpen(true)
                        }}>Edit</button> */}

                        <Popconfirm
                            title="Delete the user"
                            description={`Are you sure to delete this user. name = ${record.title}?`}
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
            `http://localhost:8000/api/v1/tracks?current=${page}&pageSize=${pageSize}`,
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
        setListTracks(d?.data?.result)
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
                dataSource={listTracks}
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

export default TracksTable;