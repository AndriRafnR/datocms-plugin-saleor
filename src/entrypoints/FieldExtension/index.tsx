import { useState, useEffect, useMemo } from 'react'
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Canvas, Button } from 'datocms-react-ui'

import SaleorClient, { Config, Node, Product } from '../../classes/SaleorClient'
import ProductBlock from '../../components/ProductBlock'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import get from 'lodash-es/get';

import s from './styles.module.css'

type PropTypes = {
  ctx: RenderFieldExtensionCtx
}

type FetchResult = {
  product: Product
  productVariant: Product
}

export default function FieldExtension({ ctx }: PropTypes) {
  const config: Config = ctx.plugin.attributes.parameters as Config

  {
    /* Init Client  */
  }
  const client = useMemo(() => new SaleorClient(config), [config])

  const [product, setProduct] = useState<Product>()

  const handleOpenModal = async () => {
    const result: Node = (await ctx.openModal({
      id: 'ProductModal',
      title: 'Browse Saleor Products',
      width: 'l',
      parameters: { config },
    })) as Node

    if (result) {
      const selected = result.node
      setProduct(selected)
      ctx.setFieldValue(ctx.fieldPath, selected.id)
    }
  }

  useEffect(() => {
    const currentValue = get(ctx.formValues, ctx.fieldPath) as string | null;
    if (currentValue && currentValue !== '') {
      const fetchData = async () => {
        await client
          .productMatching(currentValue)
          .then(({ product, productVariant }: FetchResult) => {
            const result = product || productVariant
            setProduct(result)
          })
      }
      fetchData().catch(console.error)
    }
  }, [])

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const handleRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setProduct(undefined)
    ctx.setFieldValue(ctx.fieldPath, '')
  }

  return (
    <Canvas ctx={ctx}>
      <div className={s['field-wrap']}>
        {product && (
          /* Product block */
          <div className={s['selected']}>
            <button type='button' onClick={(e) => handleRemove(e)} className={s['remove']}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </button>
            <ProductBlock product={product} selected={true} />
          </div>
        )}
        {/* Modal button */}
        <Button
          className={s['trigger-overlay']}
          buttonType='primary'
          onClick={handleOpenModal}
          buttonSize='s'
          leftIcon={<FontAwesomeIcon icon={faSearch} />}
        >
          Browse Saleor Products
        </Button>
      </div>
    </Canvas>
  )
}
