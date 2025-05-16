import { DiffItem } from "./type";
export class Diff {
    static myersDiff(oldStr: string, newStr: string): DiffItem[] {
        const oldLines = oldStr.split('\n');
        const newLines = newStr.split('\n');
        
        // 计算最短编辑脚本
        const trace = this.computeEditScript(oldLines, newLines);
        
        // 根据编辑脚本生成差异结果
        return this.buildDiffResult(oldLines, newLines, trace);
    }
    
    private static computeEditScript(oldLines: string[], newLines: string[]): number[][] {
        const n = oldLines.length;
        const m = newLines.length;
        const max = n + m;
        
        // 存储编辑路径
        const v: number[] = new Array(2 * max + 1).fill(0);
        const trace: number[][] = [];
        
        // 初始化
        v[1] = 0;
        
        for (let d = 0; d <= max; d++) {
            // 保存当前路径
            trace.push([...v]);
            
            for (let k = -d; k <= d; k += 2) {
                // 确定是向下还是向右移动
                let x: number;
                if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
                    // 向下移动
                    x = v[k + 1 + max];
                } else {
                    // 向右移动
                    x = v[k - 1 + max] + 1;
                }
                
                // 计算 y 坐标
                let y = x - k;
                
                // 沿对角线移动（匹配相同元素）
                while (x < n && y < m && oldLines[x] === newLines[y]) {
                    x++;
                    y++;
                }
                
                // 更新路径
                v[k + max] = x;
                
                // 如果到达终点，返回编辑路径
                if (x >= n && y >= m) {
                    return trace;
                }
            }
        }
        
        return trace;
    }
    
    private static buildDiffResult(oldLines: string[], newLines: string[], trace: number[][]): DiffItem[] {
        const n = oldLines.length;
        const m = newLines.length;
        const max = n + m;
        
        // 差异结果
        const result: DiffItem[] = [];
        
        // 从终点回溯到起点
        let x = n;
        let y = m;
        
        // 从最后一步开始回溯
        for (let d = trace.length - 1; d > 0; d--) {
            const v = trace[d];
            const k = x - y;
            
            // 确定前一个点的坐标
            let prevK: number;
            if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
                // 前一步是向下移动
                prevK = k + 1;
            } else {
                // 前一步是向右移动
                prevK = k - 1;
            }
            
            // 计算前一个点的坐标
            const prevX = v[prevK + max];
            const prevY = prevX - prevK;
            
            // 处理对角线移动（匹配相同元素）
            while (x > prevX && y > prevY) {
                result.unshift({ type: 'equal', value: oldLines[x - 1] });
                x--;
                y--;
            }
            
            // 处理垂直或水平移动
            if (x > prevX) {
                // 水平移动（删除）
                result.unshift({ type: 'delete', value: oldLines[x - 1] });
                x--;
            } else if (y > prevY) {
                // 垂直移动（插入）
                result.unshift({ type: 'insert', value: newLines[y - 1] });
                y--;
            }
        }
        
        // 处理剩余的相等部分（从起点到第一个差异点）
        while (x > 0 && y > 0) {
            result.unshift({ type: 'equal', value: oldLines[x - 1] });
            x--;
            y--;
        }
        
        // 处理剩余的删除或插入
        while (x > 0) {
            result.unshift({ type: 'delete', value: oldLines[x - 1] });
            x--;
        }
        
        while (y > 0) {
            result.unshift({ type: 'insert', value: newLines[y - 1] });
            y--;
        }
        
        // 后处理：将相邻的删除和插入识别为修改操作
        return this.identifyModifications(result);
    }

    private static identifyModifications(diff: DiffItem[]): DiffItem[] {
        const result: DiffItem[] = [];
        
        for (let i = 0; i < diff.length; i++) {
            // 检查当前项是否为删除，且下一项是否为插入
            if (i < diff.length - 1 && diff[i].type === 'delete' && diff[i + 1].type === 'insert') {
                // 将这对删除-插入识别为修改操作
                result.push({
                    type: 'modify',
                    oldValue: (diff as any)[i].value,
                    newValue: (diff as any)[i + 1].value
                });
                // 跳过下一项，因为已经处理了
                i++;
            } else {
                // 保持原样
                result.push(diff[i]);
            }
        }
        
        return result;
    }
    
    // 辅助方法：将差异结果转换为统一格式
    static formatUnified(diff: DiffItem[], context: number = 3) {
        const result: string[] = [];
        let currentGroup: DiffItem[] = [];
        
        // 处理每个差异块
        for (let i = 0; i < diff.length; i++) {
            const current = diff[i];
            
            // 如果当前差异与前一个不同，或者是最后一个元素
            if (i === diff.length - 1 || current.type !== diff[i + 1].type) {
                currentGroup.push(current);
                
                // 输出当前组
                if (currentGroup.length > 0) {
                    const type = currentGroup[0].type;
                    const prefix = type === 'insert' ? '+' : type === 'delete' ? '-' : ' ';
                    
                    for (const item of currentGroup) {
                        result.push(`${prefix}${(item as any).value}`);
                    }
                    
                    // 重置当前组
                    currentGroup = [];
                }
            } else {
                currentGroup.push(current);
            }
        }
        
        return result.join('\n');
    }
}