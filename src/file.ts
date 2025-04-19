import { source } from './source'
import { sourceType } from './type'
import path from 'path'
import fs from 'fs'

export class file {
    private dataDir: string
    constructor(dataDir: string) {
        this.dataDir = dataDir
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
        for (const type of sourceType) {
            const filePath = path.join(dataDir, `${type}.md`)
            if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '文件初始化完成', 'utf-8')
        }
    }

    async updateFile(type: sourceType, content: string) {
        const filePath = path.join(this.dataDir, `${type}.md`)
        fs.writeFileSync(filePath, content, 'utf-8')
    }

    async getFile(type: sourceType) {
        const filePath = path.join(this.dataDir, `${type}.md`)
        if (!fs.existsSync(filePath)) return ''
        return fs.readFileSync(filePath, 'utf-8')
    }
}