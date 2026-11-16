-- Transacciones de las órdenes de donación.
--
-- save_order_changes aplica en una sola operación los cambios de campos de la
-- orden, las asociaciones de equipos y las desvinculaciones con su estado de
-- retorno. change_order_status cambia el estado de la orden y el de todos sus
-- equipos asociados en una sola operación.
--
-- Postgres envuelve cada llamada a función en una transacción implícita: si la
-- función lanza una excepción, no queda escrito ninguno de sus cambios.


CREATE OR REPLACE FUNCTION public.save_order_changes(
    p_order_id uuid,
    p_recipient text,
    p_delivery_date date,
    p_description text,
    p_attach jsonb,
    p_detach jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_status text;
    v_item jsonb;
    v_notebook_id uuid;
    v_return_status text;
    v_notebook_status text;
    v_notebook_order_id uuid;
    v_attach_ids uuid[] := ARRAY[]::uuid[];
BEGIN
    SELECT o.status INTO v_order_status
    FROM public.orders o
    WHERE o.id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La orden % no existe', p_order_id;
    END IF;

    IF v_order_status <> 'En Preparación' THEN
        RAISE EXCEPTION 'La orden % está en estado % y no se puede editar', p_order_id, v_order_status;
    END IF;

    IF p_recipient IS NULL OR btrim(p_recipient) = '' THEN
        RAISE EXCEPTION 'El destinatario es obligatorio';
    END IF;

    IF p_delivery_date IS NULL THEN
        RAISE EXCEPTION 'La fecha de entrega es obligatoria';
    END IF;

    FOR v_item IN SELECT e.value FROM jsonb_array_elements(COALESCE(p_attach, '[]'::jsonb)) AS e(value) LOOP
        v_notebook_id := (CASE WHEN jsonb_typeof(v_item) = 'string' THEN v_item #>> '{}' ELSE v_item ->> 'notebookId' END)::uuid;

        IF v_notebook_id IS NULL THEN
            RAISE EXCEPTION 'Un equipo a asociar no tiene identificador';
        END IF;

        IF v_notebook_id = ANY(v_attach_ids) THEN
            RAISE EXCEPTION 'El equipo % está repetido en la lista de asociación', v_notebook_id;
        END IF;

        SELECT n.status, n.order_id INTO v_notebook_status, v_notebook_order_id
        FROM public.notebooks n
        WHERE n.id = v_notebook_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'El equipo % no existe', v_notebook_id;
        END IF;

        IF v_notebook_status IS DISTINCT FROM 'Listo para Donar' THEN
            RAISE EXCEPTION 'El equipo % no está en estado Listo para Donar', v_notebook_id;
        END IF;

        IF v_notebook_order_id IS NOT NULL THEN
            RAISE EXCEPTION 'El equipo % ya está asociado a una orden', v_notebook_id;
        END IF;

        v_attach_ids := array_append(v_attach_ids, v_notebook_id);
    END LOOP;

    FOR v_item IN SELECT e.value FROM jsonb_array_elements(COALESCE(p_detach, '[]'::jsonb)) AS e(value) LOOP
        v_notebook_id := (CASE WHEN jsonb_typeof(v_item) = 'string' THEN v_item #>> '{}' ELSE v_item ->> 'notebookId' END)::uuid;
        v_return_status := CASE WHEN jsonb_typeof(v_item) = 'string' THEN NULL ELSE v_item ->> 'status' END;

        IF v_notebook_id IS NULL THEN
            RAISE EXCEPTION 'Un equipo a desvincular no tiene identificador';
        END IF;

        IF v_notebook_id = ANY(v_attach_ids) THEN
            RAISE EXCEPTION 'El equipo % no puede asociarse y desvincularse en el mismo guardado', v_notebook_id;
        END IF;

        SELECT n.status, n.order_id INTO v_notebook_status, v_notebook_order_id
        FROM public.notebooks n
        WHERE n.id = v_notebook_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'El equipo % no existe', v_notebook_id;
        END IF;

        IF v_notebook_order_id IS DISTINCT FROM p_order_id THEN
            RAISE EXCEPTION 'El equipo % no está asociado a esta orden', v_notebook_id;
        END IF;

        IF v_return_status IS NULL OR v_return_status NOT IN ('Recibido', 'En Reparación', 'Listo para Donar', 'Donado', 'Bloqueada', 'Instalar SO') THEN
            RAISE EXCEPTION 'El estado de retorno % no es un estado de equipo válido', v_return_status;
        END IF;
    END LOOP;

    UPDATE public.orders
    SET recipient = p_recipient,
        "deliveryDate" = p_delivery_date,
        description = p_description
    WHERE id = p_order_id;

    UPDATE public.notebooks
    SET order_id = p_order_id
    WHERE id = ANY(v_attach_ids);

    FOR v_item IN SELECT e.value FROM jsonb_array_elements(COALESCE(p_detach, '[]'::jsonb)) AS e(value) LOOP
        v_notebook_id := (CASE WHEN jsonb_typeof(v_item) = 'string' THEN v_item #>> '{}' ELSE v_item ->> 'notebookId' END)::uuid;
        v_return_status := CASE WHEN jsonb_typeof(v_item) = 'string' THEN NULL ELSE v_item ->> 'status' END;

        UPDATE public.notebooks
        SET order_id = NULL,
            status = v_return_status
        WHERE id = v_notebook_id;
    END LOOP;
END;
$$;


CREATE OR REPLACE FUNCTION public.change_order_status(
    p_order_id uuid,
    p_status text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_status text;
    v_notebook_status text;
BEGIN
    SELECT o.status INTO v_current_status
    FROM public.orders o
    WHERE o.id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La orden % no existe', p_order_id;
    END IF;

    IF p_status IS NULL OR p_status NOT IN ('En Preparación', 'Donado') THEN
        RAISE EXCEPTION 'El estado % no es un estado de orden válido', p_status;
    END IF;

    IF v_current_status = p_status THEN
        RAISE EXCEPTION 'La orden % ya está en estado %', p_order_id, p_status;
    END IF;

    IF p_status = 'Donado' THEN
        v_notebook_status := 'Donado';
    ELSE
        v_notebook_status := 'Listo para Donar';
    END IF;

    UPDATE public.orders
    SET status = p_status
    WHERE id = p_order_id;

    UPDATE public.notebooks
    SET status = v_notebook_status
    WHERE order_id = p_order_id;
END;
$$;


ALTER TABLE public.orders
    ADD CONSTRAINT orders_status_check CHECK (status IN ('En Preparación', 'Donado'));
