import { Button, Form, Input, List, Modal, Tabs, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  deleteCategory,
  getCategories,
  saveCategory,
  updateCategory,
} from '../storage'
import type { Category, RecordType } from '../types'

interface CategoryFormValues {
  icon: string
  name: string
}

export default function CategoryManage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [activeType, setActiveType] = useState<RecordType>('expense')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form] = Form.useForm<CategoryFormValues>()

  const load = useCallback(async () => {
    try {
      setCategories(await getCategories())
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const list = categories.filter((c) => c.type === activeType)

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ icon: '📌', name: '' })
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    form.setFieldsValue({ icon: cat.icon, name: cat.name })
    setModalOpen(true)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    try {
      if (editing) {
        await updateCategory(editing.id, {
          icon: values.icon.trim(),
          name: values.name.trim(),
        })
      } else {
        await saveCategory({
          icon: values.icon.trim(),
          name: values.name.trim(),
          type: activeType,
        })
      }
      setModalOpen(false)
      message.success(editing ? '已更新' : '已添加')
      await load()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '保存失败')
    }
  }

  const handleDelete = (cat: Category) => {
    Modal.confirm({
      title: '确认删除该分类？',
      onOk: async () => {
        try {
          await deleteCategory(cat.id)
          message.success('已删除')
          await load()
        } catch (e) {
          message.warning(e instanceof Error ? e.message : '删除失败')
        }
      },
    })
  }

  return (
    <div className="page category-page">
      <div className="page-header">
        <div className="page-header-left">
          <Button type="text" onClick={() => navigate(-1)}>
            ← 返回
          </Button>
          <h2 className="page-title">分类管理</h2>
        </div>
        <Button type="primary" onClick={openAdd}>
          添加分类
        </Button>
      </div>

      <Tabs
        activeKey={activeType}
        onChange={(k) => setActiveType(k as RecordType)}
        items={[
          { key: 'expense', label: '💸 支出分类' },
          { key: 'income', label: '💰 收入分类' },
        ]}
      />

      <List
        dataSource={list}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="edit" type="link" onClick={() => openEdit(item)}>
                编辑
              </Button>,
              <Button key="del" type="link" danger onClick={() => handleDelete(item)}>
                删除
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<span className="cat-icon">{item.icon}</span>}
              title={item.name}
            />
          </List.Item>
        )}
      />

      <Modal
        title={editing ? '编辑分类' : '添加分类'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="icon"
            label="图标（Emoji）"
            rules={[{ required: true, message: '请输入图标' }]}
          >
            <Input placeholder="例如 🍔" maxLength={4} />
          </Form.Item>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="分类名称" maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
